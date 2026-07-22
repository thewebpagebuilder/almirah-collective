import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { orderItems, orders, products } from "@/db/schema";
import { ensureSeeded } from "@/lib/seed";
import { generateOrderNumber } from "@/lib/utils";
import { BRAND } from "@/lib/catalog";
import { sendOrderNotification } from "@/lib/notifications";

const checkoutSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name is required"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Must be a valid 10-digit Indian phone number"),
  items: z.array(
    z.object({
      productId: z.number(),
      quantity: z.number().min(1),
      size: z.string().optional(),
      color: z.string().optional(),
    })
  ).min(1, "Cart cannot be empty"),
  address: z.object({
    line1: z.string().min(5, "Address line 1 is required"),
    line2: z.string().optional(),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    postalCode: z.string().regex(/^\d{6}$/, "Must be a valid 6-digit postal code"),
    country: z.string().optional(),
  }),
  discountCode: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    await ensureSeeded();
    const rawBody = await request.json();
    const result = checkoutSchema.safeParse(rawBody);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Invalid checkout data" },
        { status: 400 }
      );
    }

    const body = result.data;

    if (!body.email || !body.name || !body.items?.length || !body.address?.line1) {
      return NextResponse.json({ error: "Incomplete checkout data" }, { status: 400 });
    }

    const lines: {
      productId: number;
      productName: string;
      productImage: string | null;
      size?: string;
      color?: string;
      quantity: number;
      unitPrice: string;
      lineTotal: string;
    }[] = [];

    let subtotal = 0;

    for (const item of body.items) {
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, item.productId))
        .limit(1);
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 400 },
        );
      }
      const unit = Number(product.price);
      const qty = Math.max(1, item.quantity);
      const lineTotal = unit * qty;
      subtotal += lineTotal;
      lines.push({
        productId: product.id,
        productName: product.name,
        productImage: product.images[0] ?? null,
        size: item.size,
        color: item.color,
        quantity: qty,
        unitPrice: String(unit),
        lineTotal: String(lineTotal),
      });

      const sizeToDeduct = item.size || "Free Size";
      const currentStockBySize = product.stockBySize as Record<string, number>;
      const currentSizeStock = currentStockBySize[sizeToDeduct] || 0;
      
      if (currentSizeStock < qty) {
        return NextResponse.json(
          { error: `Sorry, ${product.name} in size ${sizeToDeduct} is out of stock. Every piece is 1 of 1.` },
          { status: 400 }
        );
      }

      const newStockBySize = { 
        ...currentStockBySize, 
        [sizeToDeduct]: currentSizeStock - qty 
      };
      const newTotalStock = Object.values(newStockBySize).reduce((a, b) => a + b, 0);

      await db
        .update(products)
        .set({ 
          stockBySize: newStockBySize,
          stock: newTotalStock
        })
        .where(eq(products.id, product.id));
    }

    let discountAmount = 0;
    if (body.discountCode?.toUpperCase() === BRAND.discountCode) {
      discountAmount = subtotal * 0.1; // 10% off
    }

    const finalSubtotal = subtotal - discountAmount;
    const shipping = finalSubtotal >= BRAND.freeShippingThreshold ? 0 : 299;
    const total = finalSubtotal + shipping;

    const [order] = await db
      .insert(orders)
      .values({
        orderNumber: generateOrderNumber(),
        customerEmail: body.email.trim().toLowerCase(),
        customerName: body.name.trim(),
        status: "placed",
        subtotal: String(finalSubtotal),
        shipping: String(shipping),
        tax: "0",
        total: String(total),
        shippingAddress: {
          line1: body.address.line1,
          line2: body.address.line2,
          city: body.address.city,
          state: body.address.state,
          postalCode: body.address.postalCode,
          country: body.address.country || "India",
        },
      })
      .returning();

    await db.insert(orderItems).values(
      lines.map((l) => ({
        orderId: order.id,
        productId: l.productId,
        productName: l.productName,
        productImage: l.productImage,
        size: l.size,
        color: l.color,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        lineTotal: l.lineTotal,
      })),
    );

    // Send notifications on placement
    await sendOrderNotification({ ...order, phone: body.phone }, "placed");

    return NextResponse.json({
      orderNumber: order.orderNumber,
      total: order.total,
      message: "Order placed successfully",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}

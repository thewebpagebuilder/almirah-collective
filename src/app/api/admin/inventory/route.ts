import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { ensureSeeded } from "@/lib/seed";

export async function PATCH(request: Request) {
  try {
    await ensureSeeded();
    const body = (await request.json()) as {
      id?: number;
      stockBySize?: Record<string, number>;
      price?: string;
      compareAtPrice?: string;
    };

    if (!body.id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const updates: any = { updatedAt: new Date() };

    if (body.stockBySize) {
      updates.stockBySize = body.stockBySize;
      updates.stock = Object.values(body.stockBySize).reduce((a, b) => a + b, 0);
    }
    
    if (body.price !== undefined) updates.price = String(body.price);
    if (body.compareAtPrice !== undefined) updates.compareAtPrice = body.compareAtPrice ? String(body.compareAtPrice) : null;

    const [updated] = await db
      .update(products)
      .set(updates)
      .where(eq(products.id, body.id))
      .returning();

    return NextResponse.json({ product: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureSeeded();
    const body = await request.json();
    
    // Auto-generate slug from name
    const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const totalStock = Object.values(body.stockBySize || {}).reduce((a: any, b: any) => a + b, 0) as number;

    const [newProduct] = await db.insert(products).values({
      slug,
      name: body.name,
      description: body.description,
      shortDescription: body.description.substring(0, 150) + "...",
      categorySlug: body.categorySlug || "womens-wear",
      price: String(body.price),
      images: [body.image],
      colors: [], // Can be expanded later
      sizes: Object.keys(body.stockBySize || {}).filter(s => (body.stockBySize[s] as number) > 0),
      stockBySize: body.stockBySize,
      stock: totalStock,
    }).returning();

    return NextResponse.json({ product: newProduct });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    await db.delete(products).where(eq(products.id, Number(id)));

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

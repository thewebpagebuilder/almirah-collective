import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(request: Request) {
  try {
    const { updates } = await request.json();
    
    if (!Array.isArray(updates)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    // Process updates sequentially to ensure correctness
    for (const update of updates) {
      if (!update.id) continue;
      
      const updateData: any = {};
      if (update.price !== undefined) updateData.price = update.price;
      if (update.compareAtPrice !== undefined) updateData.compareAtPrice = update.compareAtPrice;
      if (update.images !== undefined) updateData.images = update.images;
      if (update.stock !== undefined) updateData.stock = update.stock;
      if (update.stockBySize !== undefined) updateData.stockBySize = update.stockBySize;

      if (Object.keys(updateData).length > 0) {
        await db
          .update(products)
          .set(updateData)
          .where(eq(products.id, update.id));
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Bulk update error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

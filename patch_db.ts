import { eq } from "drizzle-orm";
import { db } from "./src/db/index";
import { products, categories, orderItems } from "./src/db/schema";
import { PRODUCTS, CATEGORIES } from "./src/lib/catalog";

async function patchDb() {
  console.log("Patching products...");
  for (const p of PRODUCTS) {
    await db.update(products).set({
      images: p.images
    }).where(eq(products.slug, p.slug));
  }
  
  console.log("Patching categories...");
  for (const c of CATEGORIES) {
    await db.update(categories).set({
      imageUrl: c.image
    }).where(eq(categories.slug, c.slug));
  }
  
  console.log("Patching orderItems...");
  const existingOrderItems = await db.select().from(orderItems);
  for (const item of existingOrderItems) {
    if (item.productImage?.startsWith('/images')) {
      const newUrl = item.productImage.replace('/images/products/', 'https://zscukxpafikmszrqwodc.supabase.co/storage/v1/object/public/product-images/');
      await db.update(orderItems).set({ productImage: newUrl }).where(eq(orderItems.id, item.id));
    }
  }

  console.log("Database patch complete! All images now point to Supabase.");
  process.exit(0);
}

patchDb().catch(console.error);

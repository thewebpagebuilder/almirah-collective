import type { Metadata } from "next";
import Link from "next/link";
import { desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { ensureSeeded } from "@/lib/seed";
import { CATEGORIES } from "@/lib/catalog";
import { ProductCard } from "@/components/product/product-card";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Shop All",
  description: "Browse the complete Almirah Collective edit — genuine branded fashion across all categories.",
};

export default async function ShopPage() {
  await ensureSeeded();
  const all = await db.select().from(products).where(sql`products.stock > 0`).orderBy(desc(products.isFeatured));

  return (
    <div className="mx-auto max-w-[1440px] px-5 pb-24 pt-32 md:pt-36 md:px-8">
      <div className="max-w-2xl">
        <p className="text-[10px] uppercase tracking-[0.3em] text-champagne-dark">
          Collections
        </p>
        <h1 className="mt-3 font-serif text-3xl md:text-4xl lg:text-5xl">Shop All</h1>
        <p className="mt-4 text-sm leading-relaxed text-obsidian/60">
          Explore quiet luxury across menswear, womenswear, Indian casuals, and evening.
        </p>
      </div>

      <div className="mt-10 flex gap-2 overflow-x-auto pb-2">
        <Link
          href="/shop"
          className="shrink-0 border border-obsidian bg-obsidian px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-pearl"
        >
          All
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/shop/${c.slug}`}
            className="shrink-0 border border-obsidian/15 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-obsidian/70 hover:border-obsidian"
          >
            {c.name}
          </Link>
        ))}
      </div>

      <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
        {all.map((p) => (
          <ProductCard
            key={p.id}
            slug={p.slug}
            name={p.name}
            price={p.price}
            compareAtPrice={p.compareAtPrice}
            images={p.images}
            categorySlug={p.categorySlug}
            tags={p.tags}
          />
        ))}
      </div>
    </div>
  );
}

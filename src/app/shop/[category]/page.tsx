import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { ensureSeeded } from "@/lib/seed";
import { CATEGORIES } from "@/lib/catalog";
import { ProductCard } from "@/components/product/product-card";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const cat = CATEGORIES.find((c) => c.slug === category);
  return {
    title: cat?.name ?? "Category",
    description: cat?.description,
  };
}

export default async function CategoryPage({ params }: Props) {
  await ensureSeeded();
  const { category } = await params;
  const cat = CATEGORIES.find((c) => c.slug === category);
  if (!cat) notFound();

  const items = await db
    .select()
    .from(products)
    .where(and(eq(products.categorySlug, category), sql`products.stock > 0`));

  return (
    <div className="mx-auto max-w-[1440px] px-5 pb-24 pt-32 md:pt-36 md:px-8">
      <nav className="text-[11px] uppercase tracking-[0.15em] text-obsidian/40">
        <Link href="/shop" className="hover:text-obsidian">
          Shop
        </Link>
        <span className="mx-2">/</span>
        <span className="text-obsidian">{cat.name}</span>
      </nav>
      <h1 className="mt-4 font-serif text-3xl md:text-4xl lg:text-5xl">{cat.name}</h1>
      <p className="mt-4 max-w-xl text-sm text-obsidian/60">{cat.description}</p>

      <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
        {items.map((p) => (
          <ProductCard
            key={p.id}
            slug={p.slug}
            name={p.name}
            price={p.price}
            compareAtPrice={p.compareAtPrice}
            images={p.images}
            tags={p.tags}
          />
        ))}
      </div>

      {items.length === 0 && (
        <p className="mt-16 text-center text-obsidian/50">
          New pieces arriving soon for this collection.
        </p>
      )}
    </div>
  );
}

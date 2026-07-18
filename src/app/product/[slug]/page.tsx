import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq, ne, and } from "drizzle-orm";
import { db } from "@/db";
import { products, reviews } from "@/db/schema";
import { ensureSeeded } from "@/lib/seed";
import { ProductDetailClient } from "@/components/product/product-detail-client";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await ensureSeeded();
  const { slug } = await params;
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.shortDescription || product.description.slice(0, 160),
    openGraph: {
      images: product.images[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  await ensureSeeded();
  const { slug } = await params;

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);

  if (!product) notFound();

  const [productReviews, related] = await Promise.all([
    db.select().from(reviews).where(eq(reviews.productId, product.id)),
    db
      .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      price: products.price,
      images: products.images,
      stockBySize: products.stockBySize,
      })
      .from(products)
      .where(
        and(
          eq(products.categorySlug, product.categorySlug),
          ne(products.id, product.id),
        ),
      )
      .limit(4),
  ]);

  return (
    <>
      <ProductDetailClient
        product={product}
        reviews={productReviews}
        related={related}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.description,
            image: product.images,
            sku: product.slug,
            brand: { "@type": "Brand", name: "Almirah Collective" },
            offers: {
              "@type": "Offer",
              priceCurrency: "INR",
              price: product.price,
              availability:
                product.stock > 0
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
            },
            aggregateRating: product.reviewCount
              ? {
                  "@type": "AggregateRating",
                  ratingValue: product.rating,
                  reviewCount: product.reviewCount,
                }
              : undefined,
          }),
        }}
      />
    </>
  );
}

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Package, Sparkles, Truck, Heart, CheckSquare, MessageCircle } from "lucide-react";
import { desc, eq, and, sql } from "drizzle-orm";
import { db } from "@/db";
import { products, pressMentions, reviews } from "@/db/schema";
import { ensureSeeded } from "@/lib/seed";
import {
  CATEGORIES,
  LOOKBOOK,
  BRAND,
  OCCASIONS,
} from "@/lib/catalog";
import { SilkBackground } from "@/components/home/silk-background";
import { HeroSlideshow } from "@/components/home/hero-slideshow";
import { Marquee } from "@/components/home/marquee";
import { TrustMarquee } from "@/components/home/trust-marquee";
import { ReviewsMarquee } from "@/components/home/reviews-marquee";
import { NewsletterForm } from "@/components/home/newsletter-form";
import { TrustBadges } from "@/components/home/trust-badges";
import { ProductCard } from "@/components/product/product-card";
import { MagneticButton } from "@/components/ui/magnetic-button";

export const revalidate = 60;

const OCCASION_ICONS: Record<string, string> = {
  briefcase: "💼",
  coffee: "☕",
  sparkles: "✨",
  moon: "🌙",
};

export default async function HomePage() {
  await ensureSeeded();

  const [featured, trending, press, allProducts, approvedReviews] = await Promise.all([
    db
      .select()
      .from(products)
      .where(and(eq(products.isFeatured, true), sql`products.stock > 0`))
      .orderBy(desc(products.rating))
      .limit(8),
    db
      .select()
      .from(products)
      .where(and(eq(products.isTrending, true), sql`products.stock > 0`))
      .orderBy(desc(products.reviewCount))
      .limit(8),
    db.select().from(pressMentions).orderBy(pressMentions.sortOrder),
    db
      .select({
        id: products.id,
        slug: products.slug,
        name: products.name,
        categorySlug: products.categorySlug,
        images: products.images,
        price: products.price,
        tags: products.tags,
      })
      .from(products),
    db
      .select()
      .from(reviews)
      .where(eq(reviews.isApproved, true))
      .orderBy(desc(reviews.createdAt))
      .catch(() => []),
  ]);

  const pressItems =
    press.length > 0
      ? press.map((p) => ({ outlet: p.outlet, quote: p.quote }))
      : [
          {
            outlet: "Community",
            quote: "Handpicked branded fashion without the retail markup.",
          },
        ];

  const heroSlides = [
    { src: "/images/home/slide_1.jpg", alt: "Active Wear", category: "Active Wear" },
    { src: "/images/home/slide_2.jpg", alt: "Women's Wear", category: "Women's Wear" },
    { src: "/images/home/slide_3.jpg", alt: "Men's Wear", category: "Men's Wear" },
    { src: "/images/home/slide_4.jpg", alt: "Accessories", category: "Accessories" }
  ];

  const brandCount = BRAND.brandsCarried.length;

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[100svh] overflow-hidden">
        <SilkBackground />
        <div className="relative mx-auto grid min-h-[100svh] max-w-[1440px] items-center gap-8 px-5 pb-16 pt-36 md:grid-cols-[1.2fr_1fr] md:px-8 md:pt-32">
          <div className="animate-fade-up order-2 md:order-1">
            <div className="inline-flex items-center gap-2 border border-champagne/40 bg-pearl/70 px-3 py-1.5 text-[10px] uppercase tracking-[0.28em] text-champagne-dark backdrop-blur">
              <Sparkles className="h-3 w-3" />
              Handpicked in Bengaluru
            </div>
            <h1 className="mt-5 max-w-xl text-balance font-serif text-[clamp(2rem,5vw,4.5rem)] leading-[0.96] text-obsidian">
              Understated luxe looks,{" "}
              <span className="italic text-champagne-dark">everyday</span>.
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-obsidian/65 md:text-lg">
              Your wardrobe, thoughtfully curated — genuine branded
              fashion, packed with care and shipped pan-India.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <MagneticButton href="/shop">Shop the Edit</MagneticButton>
              <MagneticButton href="/lookbook" variant="secondary">
                View Lookbook
              </MagneticButton>
            </div>
          </div>
          <div className="order-1 md:order-2 h-[60vh] md:h-[80vh] w-full border-[6px] border-pearl bg-beige shadow-[0_30px_70px_rgba(11,11,12,0.28)]">
            <HeroSlideshow slides={heroSlides} />
          </div>
        </div>
      </section>

      {/* Brand strip */}
      <section className="border-y border-obsidian/8 bg-obsidian py-5">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-center gap-x-8 gap-y-3 px-5 md:px-8">
          <span className="text-[10px] uppercase tracking-[0.28em] text-champagne">
            Labels we love
          </span>
          {BRAND.brandsCarried.map((b) => (
            <span
              key={b}
              className="text-[11px] uppercase tracking-[0.22em] text-pearl/55"
            >
              {b}
            </span>
          ))}
        </div>
      </section>

      {/* Trust row */}
      <section className="mx-auto flex max-w-[1440px] flex-wrap justify-between gap-6 px-5 py-10 md:px-8 border-b border-obsidian/5">
        {[
          { icon: Truck, title: "₹49 Shipping.", text: "Free above ₹699" },
          { icon: Heart, title: "Brand New", text: "Fresh Stock, never worn" },
          { icon: CheckSquare, title: "Ships Pan-India", text: "Doorstep delivery nationwide" },
          { icon: MessageCircle, title: "Easy Returns", text: "Hassle-free Process" },
        ].map((item) => (
          <div key={item.title} className="flex items-center gap-3">
            <item.icon className="h-7 w-7 text-obsidian" strokeWidth={1.5} />
            <div className="flex flex-col">
              <p className="font-serif text-[15px] text-obsidian leading-snug">{item.title}</p>
              <p className="text-[13px] text-obsidian/70">{item.text}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Category showcase */}
      <section className="mx-auto max-w-[1440px] px-5 py-16 md:px-8 md:py-24">
        <div className="mb-12 flex flex-col justify-between gap-4 md:mb-16 md:flex-row md:items-end">
          <div>
            <h2 className="mt-3 font-serif text-3xl md:text-5xl">Shop by collection</h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-obsidian/60 hover:text-obsidian"
          >
            All collections <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid auto-rows-[220px] grid-cols-2 gap-3 md:auto-rows-[300px] md:grid-cols-3 md:gap-4 lg:auto-rows-[340px]">
          {[
            {
              slug: "indian-casuals",
              name: "Indian Casuals",
              description: "Everyday ethnic elegance.",
              image: "https://zscukxpafikmszrqwodc.supabase.co/storage/v1/object/public/product-images/product_8_0.png",
              span: "col-span-2 md:col-span-2",
            },
            {
              slug: "dresses",
              name: "Dresses",
              description: "Flowing silhouettes for any occasion.",
              image: "https://zscukxpafikmszrqwodc.supabase.co/storage/v1/object/public/product-images/product_50_0.png",
              span: "col-span-1",
            },
            {
              slug: "co-ord-sets",
              name: "Co-ord Sets",
              description: "Effortlessly matched separates.",
              image: "https://zscukxpafikmszrqwodc.supabase.co/storage/v1/object/public/product-images/product_15_0.png",
              span: "col-span-1",
            },
            {
              slug: "blouses-tops",
              name: "Blouses & Tops",
              description: "Versatile tops with detailed accents.",
              image: "https://zscukxpafikmszrqwodc.supabase.co/storage/v1/object/public/product-images/product_1_0.png",
              span: "col-span-1",
            },
            {
              slug: "casual-bottom-wear",
              name: "Casual Bottom Wear",
              description: "Comfortable and chic lower wear.",
              image: "https://zscukxpafikmszrqwodc.supabase.co/storage/v1/object/public/product-images/product_43_0.png",
              span: "col-span-1",
            },
            {
              slug: "party-wear",
              name: "Party Wear",
              description: "Statement pieces for evening glamour.",
              image: "https://zscukxpafikmszrqwodc.supabase.co/storage/v1/object/public/product-images/product_31_0.png",
              span: "col-span-2 md:col-span-2",
            },
            {
              slug: "active-wear",
              name: "Active-Wear",
              description: "Performance wear.",
              image: "https://zscukxpafikmszrqwodc.supabase.co/storage/v1/object/public/product-images/product_22_0.png",
              span: "col-span-2 md:col-span-1",
            },
          ].map((cat) => (
            <Link
              key={cat.slug}
              href={`/shop/${cat.slug}`}
              className={`group relative overflow-hidden bg-beige ${cat.span}`}
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                sizes="(max-width:768px) 100vw, (max-width:1024px) 50vw, 33vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/75 via-obsidian/15 to-transparent opacity-85 transition group-hover:opacity-95" />
              <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
                <p className="font-serif text-2xl text-pearl md:text-3xl">{cat.name}</p>
                <p className="mt-1 max-w-xs text-xs text-pearl/70 opacity-0 transition duration-500 group-hover:opacity-100 md:text-sm">
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="bg-beige/40 py-20 md:py-28">
        <div className="mx-auto max-w-[1440px] px-5 md:px-8">
          <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-champagne-dark">
                Curated for you
              </p>
              <h2 className="mt-3 font-serif text-3xl md:text-5xl">Featured finds</h2>
            </div>
            <MagneticButton href="/shop" variant="ghost">
              Browse all {allProducts.length} pieces
            </MagneticButton>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {featured.slice(0, 8).map((p, i) => (
              <ProductCard
                key={p.id}
                slug={p.slug}
                name={p.name}
                price={p.price}
                compareAtPrice={p.compareAtPrice}
                images={p.images}
                tags={p.tags}
                stock={p.stock}
                priority={i < 2}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Style by Occasion */}
      <section className="mx-auto max-w-[1440px] px-5 py-20 md:px-8 md:py-28">
        <div className="mb-12 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-champagne-dark">
            Style by story
          </p>
          <h2 className="mt-3 font-serif text-3xl md:text-5xl">Shop by occasion</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-obsidian/55">
            We're tagging every piece by styling story — so soon each look
            comes together effortlessly.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {OCCASIONS.map((o) => (
            <Link
              key={o.id}
              href={`/shop/${o.categorySlug}`}
              className="group relative overflow-hidden border border-obsidian/10 bg-beige/40 p-6 transition hover:border-champagne/50"
            >
              <span className="text-3xl">{OCCASION_ICONS[o.icon] ?? "✨"}</span>
              <p className="mt-4 font-serif text-2xl">{o.name}</p>
              <p className="mt-2 text-xs leading-relaxed text-obsidian/55">{o.blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Founder note */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(201,169,110,0.12),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(11,11,12,0.05),transparent_40%)]" />
        <div className="relative mx-auto grid max-w-[1100px] items-center gap-10 px-5 md:grid-cols-[1.1fr_0.9fr] md:px-8">
          <div className="bg-[#E6DBCA] p-8 md:p-12 shadow-sm rounded-sm max-w-xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37] mb-2">
              OUR STORY
            </p>
            <h2 className="font-serif text-4xl leading-tight text-obsidian md:text-5xl bg-[#D3C3A8] inline-block px-2">
              Curation over chaos.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-obsidian/80">
              Almirah Collective started with a simple frustration — too much noise,
              too many options, too little curation. Every piece is handpicked, genuine,
              and packed with care from Bengaluru. No bulk buying, no warehouse
              noise — just careful selection, one piece at a time.
            </p>
            <MagneticButton href="/about" className="mt-8 border border-obsidian text-obsidian hover:bg-obsidian hover:text-pearl bg-transparent" variant="secondary">
              OUR STORY
            </MagneticButton>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden border border-obsidian/10 bg-beige">
            <Image
              src="https://zscukxpafikmszrqwodc.supabase.co/storage/v1/object/public/product-images/product_52_0.png"
              alt="OOrchin Floral Ruffle Bell Sleeve Top"
              fill
              className="object-cover"
              sizes="40vw"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-obsidian/70 to-transparent p-6">
              <p className="font-serif text-2xl text-pearl">The Almirah</p>
              <p className="text-xs uppercase tracking-[0.2em] text-champagne">
                Personal curation · Bengaluru
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Lookbook */}
      <section className="mx-auto max-w-[1440px] px-5 py-20 md:px-8 md:py-28">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-champagne-dark">
              Shoppable editorial
            </p>
            <h2 className="mt-3 font-serif text-3xl md:text-5xl">Lookbook</h2>
          </div>
          <MagneticButton href="/lookbook" variant="ghost" className="hidden md:inline-flex">
            Full story
          </MagneticButton>
        </div>
        <div className="grid gap-4 md:grid-cols-4 md:gap-5">
          {LOOKBOOK.map((shot, i) => (
            <Link
              key={shot.title}
              href={`/product/${shot.productSlug}`}
              className={`group relative overflow-hidden ${i % 2 === 1 ? "md:mt-12" : ""}`}
            >
              <div className="relative aspect-[3/4]">
                <Image
                  src={shot.image}
                  alt={shot.title}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                  sizes="25vw"
                />
                <div className="absolute inset-0 bg-obsidian/0 transition group-hover:bg-obsidian/25" />
                <div className="absolute inset-x-0 bottom-0 translate-y-2 p-5 opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <p className="font-serif text-2xl text-pearl">{shot.title}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-champagne">
                    Shop the look
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section className="border-t border-obsidian/8 py-20 md:py-28 bg-[#FAF7F2]">
        <div className="mx-auto max-w-[1440px] px-5 md:px-8">
          <div className="mb-12 text-center">
            <h2 className="font-serif text-3xl md:text-5xl text-obsidian">Real reviews</h2>
            <p className="mt-3 text-sm text-obsidian/60">From our verified buyers across India</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Priya S.", text: "Absolutely in love with the quality. It's so rare to find genuine branded pieces in such perfect condition online. The packaging was lovely too!" },
              { name: "Ananya M.", text: "My go-to place for curated fashion now. I bought a dress for a party and got so many compliments. Authentic and beautifully packed." },
              { name: "Kavya R.", text: "Fast shipping and exactly as described. Love that I can trust Almirah Collective for authentic brands without the retail markup." }
            ].map((review, i) => (
              <div key={i} className="bg-pearl p-8 border border-obsidian/10 flex flex-col gap-4">
                <div className="flex gap-1 text-champagne-dark">
                  {"★★★★★"}
                </div>
                <p className="text-sm leading-relaxed text-obsidian/75 italic">"{review.text}"</p>
                <p className="text-xs font-bold uppercase tracking-wider mt-auto pt-4 border-t border-obsidian/5">{review.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Marquee items={pressItems} />

      {/* Newsletter */}
      <section className="relative overflow-hidden bg-obsidian py-24 text-pearl md:py-32">
        <div className="pointer-events-none absolute -right-20 top-0 h-80 w-80 rounded-full bg-champagne/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-60 w-60 rounded-full bg-champagne/5 blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-5 text-center md:px-8">
          <p className="text-[10px] uppercase tracking-[0.35em] text-champagne">
            Private list
          </p>
          <h2 className="mt-4 font-serif text-3xl md:text-5xl">
            First look at new handpicked drops
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-pearl/55">
            Join the Almirah circle for styling notes, restocks, and Bengaluru studio
            finds — no spam, only good clothes.
          </p>
          <div className="mt-10">
            <NewsletterForm />
          </div>
        </div>
      </section>

      {/* Trust Badges Marquee above footer */}
      <TrustMarquee />
    </>
  );
}

"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Ruler,
  Star,
  X,
} from "lucide-react";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { useCart } from "@/context/cart-context";
import { SIZE_CHART } from "@/lib/catalog";
import { formatCurrency, cn } from "@/lib/utils";

type Product = {
  id: number;
  slug: string;
  name: string;
  description: string;
  shortDescription: string | null;
  price: string;
  compareAtPrice: string | null;
  material: string | null;
  careInstructions: string | null;
  images: string[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  stock: number;
  stockBySize: Record<string, number>;
  rating: string | null;
  reviewCount: number;
  categorySlug: string;
};

type Review = {
  id: number;
  customerName: string;
  rating: number;
  title: string | null;
  body: string;
  photoUrl: string | null;
  isVerified: boolean;
  createdAt: Date | string;
};

export function ProductDetailClient({
  product,
  reviews,
  related,
}: {
  product: Product;
  reviews: Review[];
  related: {
    id: number;
    slug: string;
    name: string;
    price: string;
    images: string[];
  }[];
}) {
  const { addItem } = useCart();
  const [activeImage, setActiveImage] = useState(0);

  const [size, setSize] = useState(product.sizes[0] ?? "");

  const [sizeGuide, setSizeGuide] = useState(false);
  const [accordion, setAccordion] = useState<string | null>("material");
  const [zoom, setZoom] = useState(false);

  const price = Number(product.price);
  const compare = product.compareAtPrice ? Number(product.compareAtPrice) : null;

  const discountPercent = compare && compare > price 
    ? Math.round(((compare - price) / compare) * 100) 
    : 0;

  const stars = useMemo(
    () => Math.round(Number(product.rating || 0)),
    [product.rating],
  );

  function handleAdd() {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price,
      image: product.images[0],
      size,
    });
  }

  return (
    <div className="mx-auto max-w-[1440px] px-5 pb-24 pt-32 md:pt-36 md:px-8">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Gallery */}
        <div>
          <div
            className={cn(
              "relative aspect-[3/4] overflow-hidden bg-beige",
              zoom && "cursor-zoom-out",
            )}
            onClick={() => setZoom((z) => !z)}
          >
            <Image
              src={product.images[activeImage]}
              alt={product.name}
              fill
              priority
              sizes="(max-width:1024px) 100vw, 50vw"
              className={cn(
                "object-cover transition duration-500",
                zoom && "scale-150",
              )}
            />
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {product.images.map((img, i) => (
              <button
                key={img}
                type="button"
                onClick={() => {
                  setActiveImage(i);
                }}
                className={cn(
                  "relative h-20 w-16 shrink-0 overflow-hidden border",
                  activeImage === i
                    ? "border-obsidian"
                    : "border-transparent opacity-70",
                )}
              >
                <Image src={img} alt="" fill className="object-cover" sizes="64px" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-[10px] uppercase tracking-[0.25em] text-obsidian/40">
            {product.categorySlug.replace(/-/g, " ")}
          </p>
          <h1 className="mt-2 font-serif text-3xl md:text-4xl lg:text-5xl leading-tight text-obsidian">
            {product.name}
          </h1>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3.5 w-3.5",
                    i < stars
                      ? "fill-champagne text-champagne"
                      : "text-obsidian/20",
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-obsidian/50">
              {product.rating} · {product.reviewCount} reviews
            </span>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-serif text-3xl">{formatCurrency(price)}</span>
            {compare && compare > price && (
              <>
                <span className="text-obsidian/40 line-through">
                  {formatCurrency(compare)}
                </span>
                <span className="ml-2 bg-[#D4AF37]/10 px-2 py-1 text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
                  Save {discountPercent}%
                </span>
              </>
            )}
          </div>

          <div 
            className="mt-5 max-w-lg text-sm leading-relaxed text-obsidian/70 space-y-4 [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ul>li]:mb-1"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />


          {/* Sizes */}
          <div className="mt-7">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.2em] text-obsidian/50">
                Size — {size}
              </p>
              <button
                type="button"
                onClick={() => setSizeGuide(true)}
                className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.15em] text-champagne-dark"
              >
                <Ruler className="h-3.5 w-3.5" /> Find My Size
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.sizes.map((s) => {
                const isAvailable = ((product.stockBySize || {})[s] || 0) > 0;
                return (
                <button
                  key={s}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => setSize(s)}
                  className={cn(
                    "min-w-12 border px-3 py-2.5 text-sm transition relative overflow-hidden",
                    !isAvailable && "opacity-40 cursor-not-allowed bg-transparent border-obsidian/10 text-obsidian/40",
                    isAvailable && size === s
                      ? "border-obsidian bg-obsidian text-pearl"
                      : "border-obsidian/20 hover:border-obsidian",
                  )}
                >
                  {s}
                  {!isAvailable && <span className="absolute inset-0 border-t border-obsidian/40 rotate-[20deg] scale-150 origin-center" />}
                </button>
              )})}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {product.stock === 0 ? (
              <div className="flex-1 flex items-center justify-center bg-obsidian/10 text-obsidian/50 font-bold uppercase tracking-[0.2em] py-3.5 text-[11px]">
                Sold Out
              </div>
            ) : (
              <MagneticButton 
                onClick={handleAdd} 
                className="flex-1" 
              >
                Add to Bag — {formatCurrency(price)}
              </MagneticButton>
            )}
            <MagneticButton variant="secondary" className="sm:w-auto">
              Save
            </MagneticButton>
          </div>
          <p className="mt-3 text-xs text-obsidian/40">
            {product.stock === 0
              ? "Sold out — every piece is 1 of 1"
              : "In stock — ships within 48 hours"}
          </p>

          {/* Accordion */}
          <div className="mt-10 border-t border-obsidian/10">
            {[
              {
                id: "material",
                title: "Material",
                body: product.material || "Premium fabrics sourced responsibly.",
              },
              {
                id: "care",
                title: "Care Instructions",
                body:
                  product.careInstructions ||
                  "Follow garment care label. Professional cleaning recommended for silk.",
              },
              {
                id: "shipping",
                title: "Shipping",
                body: "Complimentary shipping over ₹699. Express available at checkout. Trackable courier delivery across India.",
              },
              {
                id: "returns",
                title: "Returns",
                body: "14-day returns on unworn pieces with tags. Easy RMA from your account portal.",
              },
            ].map((item) => (
              <div key={item.id} className="border-b border-obsidian/10">
                <button
                  type="button"
                  onClick={() =>
                    setAccordion((a) => (a === item.id ? null : item.id))
                  }
                  className="flex w-full items-center justify-between py-4 text-left text-[12px] uppercase tracking-[0.18em]"
                >
                  {item.title}
                  <span className="text-lg leading-none text-obsidian/40">
                    {accordion === item.id ? "−" : "+"}
                  </span>
                </button>
                {accordion === item.id && (
                  <p className="pb-4 text-sm leading-relaxed text-obsidian/65">
                    {item.body}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-24">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-champagne-dark">
              Social proof
            </p>
            <h2 className="mt-2 font-serif text-3xl md:text-4xl">Client Reviews</h2>
          </div>
        </div>
        {reviews.length === 0 ? (
          <p className="text-sm text-obsidian/50">Be the first to review this piece.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => (
              <article
                key={r.id}
                className="border border-obsidian/10 bg-pearl p-6"
              >
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-3 w-3",
                        i < r.rating
                          ? "fill-champagne text-champagne"
                          : "text-obsidian/15",
                      )}
                    />
                  ))}
                </div>
                {r.title && (
                  <h3 className="mt-3 font-serif text-xl">{r.title}</h3>
                )}
                <p className="mt-2 text-sm leading-relaxed text-obsidian/70">
                  {r.body}
                </p>
                {r.photoUrl && (
                  <div className="relative mt-4 h-40 w-full overflow-hidden">
                    <Image
                      src={r.photoUrl}
                      alt="Customer photo"
                      fill
                      className="object-cover"
                      sizes="300px"
                    />
                  </div>
                )}
                <p className="mt-4 text-[11px] uppercase tracking-[0.15em] text-obsidian/40">
                  {r.customerName}
                  {r.isVerified ? " · Verified" : ""}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Complete the look */}
      {related.length > 0 && (
        <section className="mt-24">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-serif text-3xl md:text-4xl">You May Also Like</h2>
            <div className="hidden gap-2 md:flex">
              <span className="rounded-full border border-obsidian/15 p-2">
                <ChevronLeft className="h-4 w-4" />
              </span>
              <span className="rounded-full border border-obsidian/15 p-2">
                <ChevronRight className="h-4 w-4" />
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {related.map((item) => (
              <a key={item.id} href={`/product/${item.slug}`} className="group">
                <div className="relative aspect-[3/4] overflow-hidden bg-beige">
                  <Image
                    src={item.images[0]}
                    alt={item.name}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-105"
                    sizes="25vw"
                  />
                </div>
                <p className="mt-3 font-serif text-lg">{item.name}</p>
                <p className="text-sm">{formatCurrency(item.price)}</p>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Size guide modal */}
      {sizeGuide && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-obsidian/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto bg-pearl p-6 md:p-8">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-2xl">Find My Size</h3>
              <button type="button" onClick={() => setSizeGuide(false)} aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-2 text-sm text-obsidian/60">
              Measurements in inches. Between sizes? Size up for structured pieces.
            </p>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-obsidian/15 text-[10px] uppercase tracking-[0.15em] text-obsidian/50">
                    <th className="py-2 pr-3">Size</th>
                    <th className="py-2 pr-3">Bust</th>
                    <th className="py-2 pr-3">Waist</th>
                    <th className="py-2">Hip</th>
                  </tr>
                </thead>
                <tbody>
                  {SIZE_CHART.tops.map((row) => (
                    <tr key={row.size} className="border-b border-obsidian/8">
                      <td className="py-2.5 pr-3 font-medium">{row.size}</td>
                      <td className="py-2.5 pr-3">{row.bust}</td>
                      <td className="py-2.5 pr-3">{row.waist}</td>
                      <td className="py-2.5">{row.hip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <MagneticButton className="mt-6 w-full" onClick={() => setSizeGuide(false)}>
              Apply & Close
            </MagneticButton>
          </div>
        </div>
      )}
    </div>
  );
}

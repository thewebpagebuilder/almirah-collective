"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type ProductCardProps = {
  slug: string;
  name: string;
  price: string | number;
  compareAtPrice?: string | number | null;
  images: string[];
  categorySlug?: string;
  tags?: string[];
  priority?: boolean;
};

export function ProductCard({
  slug,
  name,
  price,
  compareAtPrice,
  images,
  priority = false,
}: ProductCardProps) {
  const primary = images[0];
  const secondary = images[1] ?? images[0];

  return (
    <article className="group relative">
      <Link href={`/product/${slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-beige">
          <Image
            src={primary}
            alt={name}
            fill
            priority={priority}
            sizes="(max-width:768px) 50vw, 25vw"
            className="object-cover transition-all duration-700 group-hover:scale-105 group-hover:opacity-0"
          />
          <Image
            src={secondary}
            alt=""
            fill
            sizes="(max-width:768px) 50vw, 25vw"
            className="object-cover opacity-0 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100"
          />
          {/* Only the Save % badge — category/tag badges removed for consistency */}
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {compareAtPrice && Number(compareAtPrice) > Number(price) && (
              <span className="bg-champagne px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-obsidian">
                Save{" "}
                {Math.round(
                  ((Number(compareAtPrice) - Number(price)) /
                    Number(compareAtPrice)) *
                    100,
                )}
                %
              </span>
            )}
          </div>
          <button
            type="button"
            aria-label="Add to wishlist"
            onClick={(e) => e.preventDefault()}
            className="absolute right-3 top-3 rounded-full bg-pearl/80 p-2 opacity-0 backdrop-blur-sm transition group-hover:opacity-100"
          >
            <Heart className="h-3.5 w-3.5" />
          </button>
          <div className="absolute inset-x-0 bottom-0 translate-y-full bg-obsidian/90 px-4 py-3 text-center text-[10px] uppercase tracking-[0.2em] text-pearl transition duration-500 group-hover:translate-y-0">
            Quick view
          </div>
        </div>
        <div className="mt-3 space-y-0.5">
          <h3 className="line-clamp-2 font-serif text-sm leading-snug text-obsidian transition group-hover:text-champagne-dark md:text-base">
            {name}
          </h3>
          <div className="flex items-center gap-2 text-[13px]">
            <span className="font-medium">{formatCurrency(price)}</span>
            {compareAtPrice && Number(compareAtPrice) > Number(price) && (
              <span className="text-obsidian/40 line-through">
                {formatCurrency(compareAtPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}

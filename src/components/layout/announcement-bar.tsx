"use client";

import Link from "next/link";
import { Tag } from "lucide-react";
import { BRAND } from "@/lib/catalog";

/**
 * High-contrast nav banner: brand pill + live discount code.
 * Sits at the top of the header stack as a divider/promo strip.
 */
export function AnnouncementBar() {
  return (
    <div className="border-b border-champagne/25 bg-obsidian text-pearl">
      <div className="mx-auto flex max-w-[1440px] items-center justify-center gap-x-4 gap-y-1 px-4 py-2 text-center">
        <Link href="/" className="hidden shrink-0 items-center rounded-full border border-champagne/40 px-3 py-0.5 font-serif text-[11px] tracking-[0.18em] text-champagne sm:inline-flex hover:bg-champagne/10 transition-colors">
          {BRAND.name}
        </Link>
        <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-[11px] tracking-[0.1em] md:text-[12px]">
          <span className="text-pearl/80">First order?</span>
          <span className="inline-flex items-center gap-1 font-medium text-champagne">
            <Tag className="h-3 w-3" />
            Use Code
            <span className="rounded bg-champagne/20 px-1.5 py-0.5 font-mono tracking-widest text-pearl">
              {BRAND.discountCode}
            </span>
            for {BRAND.discountPercent}% off
          </span>
          <span className="hidden text-pearl/40 sm:inline">·</span>
          <span className="hidden text-pearl/70 sm:inline">
            Free shipping over ₹{BRAND.freeShippingThreshold}
          </span>
        </p>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { BRAND } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description: `Shipping & Returns policy for ${BRAND.name}.`,
};

export default function ShippingReturnsPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-32 md:px-8 md:pt-36">
      <p className="text-[10px] uppercase tracking-[0.3em] text-champagne-dark">
        Support
      </p>
      <h1 className="mt-3 font-serif text-3xl md:text-4xl lg:text-5xl">
        Shipping & Returns
      </h1>
      <p className="mt-4 text-sm text-obsidian/60">
        Updated for {BRAND.name} · Bengaluru-based operations
      </p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-obsidian/70">
        <section>
          <h2 className="font-serif text-2xl text-obsidian">Shipping policy</h2>
          <p className="mt-3">
            Orders are usually processed and packed within 1–3 business days from Bengaluru.
            Estimated delivery timelines are:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Metro cities: 3–7 business days</li>
            <li>Rest of India: 5–10 business days</li>
            <li>Remote locations: longer delays may apply</li>
          </ul>
          <p className="mt-3">
            We provide free shipping on orders above ₹{BRAND.freeShippingThreshold}.
            Delays can happen due to festivals, weather, courier disruptions, or verification issues.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-obsidian">Order updates</h2>
          <p className="mt-3">
            We send order updates by email and/or SMS at key stages:
            <br />
            Placed → Confirming → Packed → Dispatched → On the way → Delivered.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-obsidian">Returns and exchanges</h2>
          <p className="mt-3">
            Because many items are single-piece curated finds, returns are accepted only where
            eligible. You may request a return or exchange within 7 days of delivery if the item is:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Unworn, unwashed, and in original condition</li>
            <li>With original tags and packaging intact</li>
            <li>Not marked as final sale, altered, or customized</li>
          </ul>
          <p className="mt-3">
            Once we receive and inspect the item, approved refunds or replacements will be
            processed to the original payment method where possible.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-obsidian">Damaged or wrong items</h2>
          <p className="mt-3">
            If you received a damaged, defective, incorrect, or missing item, contact us within
            48 hours of delivery with photos or a short video along with your order number.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-obsidian">How to request support</h2>
          <p className="mt-3">
            For shipping, return, or exchange support:
            <br />
            <a href={`mailto:${BRAND.email}`} className="text-champagne-dark">
              {BRAND.email}
            </a>{" "}
            · {BRAND.phone} · Connect on WhatsApp
          </p>
        </section>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LOOKBOOK } from "@/lib/catalog";
import { MagneticButton } from "@/components/ui/magnetic-button";

export const metadata: Metadata = {
  title: "Lookbook",
  description: "Shoppable editorial stories from Almirah Collective.",
};

export default function LookbookPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-5 pb-24 pt-32 md:pt-36 md:px-8">
      <div className="max-w-2xl">
        <p className="text-[10px] uppercase tracking-[0.3em] text-champagne-dark">
          Editorial
        </p>
        <h1 className="mt-3 font-serif text-3xl md:text-4xl lg:text-5xl">Lookbook</h1>
        <p className="mt-4 text-sm text-obsidian/60">
          Shoppable narratives — click any frame to discover the pieces.
        </p>
      </div>

      <div className="mt-16 space-y-16 md:space-y-28">
        {LOOKBOOK.map((shot, i) => (
          <article
            key={shot.title}
            className={`grid items-center gap-8 md:grid-cols-2 md:gap-14 ${
              i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
            }`}
          >
            <Link
              href={`/product/${shot.productSlug}`}
              className="group relative aspect-[4/5] overflow-hidden"
            >
              <Image
                src={shot.image}
                alt={shot.title}
                fill
                className="object-cover transition duration-700 group-hover:scale-105"
                sizes="(max-width:768px) 100vw, 50vw"
              />
            </Link>
            <div className={i % 2 === 1 ? "md:text-right" : ""}>
              <p className="text-[10px] uppercase tracking-[0.3em] text-champagne-dark">
                Chapter {String(i + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-3 font-serif text-3xl md:text-5xl">{shot.title}</h2>
              <p className="mt-4 text-sm leading-relaxed text-obsidian/60">
                A considered composition of texture, silhouette, and light — styled for
                real life, elevated for presence.
              </p>
              <div className={`mt-8 ${i % 2 === 1 ? "md:flex md:justify-end" : ""}`}>
                <MagneticButton href={`/product/${shot.productSlug}`}>
                  Shop the look
                </MagneticButton>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import { Heart, Leaf, Scissors, Sparkles } from "lucide-react";
import { CORE_VALUES, BRAND, CATEGORIES, LOOKBOOK } from "@/lib/catalog";
import { MagneticButton } from "@/components/ui/magnetic-button";

export const metadata: Metadata = {
  title: "About Us",
  description: `The story of ${BRAND.name} — personal curation, genuine brands, packed from Bengaluru.`,
};

const icons = {
  scissors: Scissors,
  sparkles: Sparkles,
  leaf: Leaf,
  heart: Heart,
};

export default function AboutPage() {
  return (
    <div>
      <section className="relative min-h-[70vh] overflow-hidden">
        <Image
          src="/images/about/about_banner_wide.png"
          alt="Almirah Collective story"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-obsidian/50" />
        <div className="relative mx-auto flex min-h-[70vh] max-w-[1440px] flex-col justify-end px-5 pb-16 pt-32 md:px-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#D4AF37]">
            OUR STORY
          </p>
          <h1 className="mt-4 max-w-3xl font-serif text-5xl text-pearl md:text-7xl">
            Curation over chaos.
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-24 text-center md:px-8 md:py-32">
        <p className="text-[10px] uppercase tracking-[0.3em] text-champagne-dark">
          Hi, I&apos;m {BRAND.founder}
        </p>
        <h2 className="mt-4 font-serif text-3xl md:text-5xl">
          Built from a simple frustration
        </h2>
        <div className="mt-10 space-y-6 text-base leading-relaxed text-obsidian/70 md:text-lg">
          <p>
            Too much noise, too many options, too little curation. I wanted a store
            where every piece had actually been considered — not just listed.
          </p>
          <p>
            So I built Almirah Collective. I&apos;m constantly hunting for genuine,
            unique pieces from top global and premium labels at better prices than retail. No bulk buying, no warehouse. Just
            careful selection, one piece at a time.
          </p>
          <p>
            Every order is packed by me, from Bengaluru, and shipped pan-India. If
            it&apos;s in this store, it&apos;s because I&apos;d wear it myself.
          </p>
        </div>
      </section>

      <section className="bg-beige/50 py-24 md:py-28">
        <div className="mx-auto max-w-[1440px] px-5 md:px-8">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.3em] text-champagne-dark">
              Ethos
            </p>
            <h2 className="mt-3 font-serif text-3xl md:text-5xl">What we stand for</h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {CORE_VALUES.map((v) => {
              const Icon = icons[v.icon as keyof typeof icons] || Sparkles;
              return (
                <article
                  key={v.title}
                  className="border border-obsidian/8 bg-pearl p-8 text-center transition hover:-translate-y-1 hover:border-champagne/40"
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-champagne/40 text-champagne-dark">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-serif text-2xl">{v.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-obsidian/60">
                    {v.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-24 md:px-8 md:py-28">
        <div className="mb-12">
          <p className="text-[10px] uppercase tracking-[0.3em] text-champagne-dark">
            Behind the almirah
          </p>
          <h2 className="mt-3 font-serif text-3xl md:text-5xl">How pieces arrive</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { src: LOOKBOOK[0].image, label: "Hunt & shortlist" },
            { src: LOOKBOOK[1].image, label: "Style & photograph" },
            { src: LOOKBOOK[3].image, label: "Pack from Bengaluru" },
          ].map((shot) => (
            <div key={shot.label} className="group relative aspect-[4/5] overflow-hidden">
              <Image
                src={shot.src}
                alt={shot.label}
                fill
                className="object-cover transition duration-700 group-hover:scale-105"
                sizes="33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/65 to-transparent" />
              <p className="absolute bottom-5 left-5 font-serif text-2xl text-pearl">
                {shot.label}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-14 text-center">
          <MagneticButton href="/shop">Explore the Collection</MagneticButton>
        </div>
      </section>
    </div>
  );
}

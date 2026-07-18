"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export type HeroPanel = {
  src: string;
  alt: string;
  /** gender | style chips shown on the panel */
  chips: string[];
};

type Props = {
  /** central editorial image */
  hero: HeroPanel;
  /** surrounding satellite pieces (menswear + womenswear, ethnic + western) */
  satellites: HeroPanel[];
};

/**
 * Animated clothing collage — real product imagery floating in a magazine
 * composition with mouse parallax. Represents menswear & womenswear,
 * ethnic & western, and the "1 of 1 — every piece unique & single" ethos.
 */
export function HeroCollage({ hero, satellites }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.setProperty("--px", `${x * 18}px`);
      el.style.setProperty("--py", `${y * 18}px`);
      el.style.setProperty("--rx", `${y * -5}deg`);
      el.style.setProperty("--ry", `${x * 8}deg`);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // satellite layout positions (percentage based, responsive-safe)
  const slots: {
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
    w: string;
    z: number;
    tilt: number;
    delay: string;
  }[] = [
    { top: "2%", left: "-6%", w: "30%", z: 30, tilt: -8, delay: "0s" },
    { top: "8%", right: "-8%", w: "32%", z: 30, tilt: 9, delay: "0.8s" },
    { bottom: "4%", left: "-4%", w: "30%", z: 30, tilt: 6, delay: "1.4s" },
    { bottom: "0%", right: "-6%", w: "28%", z: 30, tilt: -7, delay: "0.4s" },
  ];

  return (
    <div
      ref={ref}
      className="relative mx-auto aspect-[4/5] w-full max-w-[30rem] [perspective:1200px]"
      style={
        {
          "--px": "0px",
          "--py": "0px",
          "--rx": "0deg",
          "--ry": "0deg",
        } as React.CSSProperties
      }
    >
      {/* soft champagne glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-2/3 w-2/3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-champagne/20 blur-3xl" />

      {/* parallax layer */}
      <div
        className="absolute inset-0 transition-transform duration-200 ease-out [transform-style:preserve-3d]"
        style={{
          transform:
            "translate3d(var(--px), var(--py), 0) rotateX(var(--rx)) rotateY(var(--ry))",
        }}
      >
        {/* central hero image */}
        <div
          className={`absolute left-1/2 top-1/2 w-[58%] -translate-x-1/2 -translate-y-1/2 ${mounted ? "animate-pop-in" : ""}`}
          style={{ zIndex: 50 }}
        >
          <div className="animate-floaty-lg overflow-hidden border-[6px] border-pearl bg-beige shadow-[0_30px_70px_rgba(11,11,12,0.28)]">
            <div className="relative aspect-[3/4]">
              <Image
                src={hero.src}
                alt={hero.alt}
                fill
                priority
                sizes="40vw"
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-obsidian/75 to-transparent p-3">
                <div className="flex flex-wrap gap-1.5">
                  {hero.chips.map((c) => (
                    <span
                      key={c}
                      className="bg-pearl/90 px-2 py-0.5 text-[8px] uppercase tracking-[0.18em] text-obsidian"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* satellite pieces */}
        {satellites.slice(0, 4).map((s, i) => {
          const slot = slots[i];
          return (
            <div
              key={s.alt + i}
              className="absolute animate-floaty overflow-hidden border-4 border-pearl bg-beige shadow-[0_18px_40px_rgba(11,11,12,0.22)]"
              style={
                {
                  top: slot.top,
                  left: slot.left,
                  right: slot.right,
                  bottom: slot.bottom,
                  width: slot.w,
                  zIndex: slot.z,
                  "--tilt": `${slot.tilt}deg`,
                  animationDelay: slot.delay,
                } as React.CSSProperties
              }
            >
              <div className="relative aspect-[3/4]">
                <Image
                  src={s.src}
                  alt={s.alt}
                  fill
                  sizes="22vw"
                  className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-obsidian/70 to-transparent p-1.5">
                  <div className="flex flex-wrap gap-1">
                    {s.chips.map((c) => (
                      <span
                        key={c}
                        className="bg-pearl/90 px-1.5 py-0.5 text-[7px] uppercase tracking-[0.14em] text-obsidian"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* rotating "1 of 1" badge */}
        <div
          className="absolute right-[2%] top-[2%] h-20 w-20 md:h-24 md:w-24"
          style={{ zIndex: 60 }}
        >
          <div className="relative h-full w-full animate-spin-badge">
            <svg viewBox="0 0 100 100" className="h-full w-full">
              <defs>
                <path
                  id="circlePath"
                  d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0"
                  fill="none"
                />
              </defs>
              <text className="fill-obsidian text-[10.5px] uppercase tracking-[0.22em]">
                <textPath href="#circlePath" startOffset="0">
                  Every piece · 1 of 1 · unique ·
                </textPath>
              </text>
            </svg>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-obsidian text-[10px] font-semibold uppercase tracking-tight text-champagne md:h-12 md:w-12">
              1/1
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export type SlideData = {
  src: string;
  alt: string;
  category: string;
};

type Props = {
  slides: SlideData[];
};

export function HeroSlideshow({ slides }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4200);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slides.length, isHovered]);

  if (!slides || slides.length === 0) return null;

  return (
    <div
      className="relative w-full h-full min-h-[500px] overflow-hidden bg-beige"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {slides.map((slide, index) => (
        <div
          key={`${slide.src}-${index}`}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-in-out",
            index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            className={cn(
              "object-cover object-center",
              // applying 7s zoom duration
              "transition-transform duration-[7000ms] ease-out",
              index === currentIndex ? "scale-105" : "scale-100"
            )}
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={index === 0}
          />
        </div>
      ))}

      {/* Caption Top-Right */}
      <div className="absolute top-4 right-4 z-20">
        <span className="bg-pearl/90 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-obsidian backdrop-blur-md shadow-sm">
          {slides[currentIndex]?.category || "Curated"}
        </span>
      </div>

      {/* Dots Bottom-Left */}
      <div className="absolute bottom-6 left-6 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={`dot-${index}`}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              index === currentIndex
                ? "bg-pearl w-6"
                : "bg-pearl/40 hover:bg-pearl/70"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

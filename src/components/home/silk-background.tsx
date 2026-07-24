"use client";

import { useEffect, useRef } from "react";

/**
 * Lightweight canvas silk/gradient mesh animation.
 * Avoids Three.js bundle cost while delivering a luxury ambient backdrop.
 */
export function SilkBackground({ className = "" }: { className?: string }) {
  return (
    <div
      className={`absolute inset-0 h-full w-full bg-gradient-to-br from-[#FAF7F2] via-[#F0E8DC] to-[#E8DFD0] ${className}`}
      aria-hidden
    />
  );
}

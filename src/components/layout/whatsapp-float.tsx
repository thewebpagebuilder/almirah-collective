"use client";

import { MessageCircle } from "lucide-react";
import { BRAND } from "@/lib/catalog";

export function WhatsAppFloat() {
  return (
    <a
      href={`https://wa.me/${BRAND.whatsapp.replace("+", "")}?text=${encodeURIComponent(
        "Hi Ameena! I need help with an Almirah Collective order / size.",
      )}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-[65] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_40px_rgba(37,211,102,0.45)] transition hover:scale-105 hover:shadow-[0_16px_48px_rgba(37,211,102,0.55)] md:bottom-8 md:right-8"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}

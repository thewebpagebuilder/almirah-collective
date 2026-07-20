"use client";

import { ShieldCheck, Lock, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const TRUST_ITEMS = [
  { icon: ShieldCheck, text: "100% Authentic" },
  { icon: Lock, text: "Secure Checkout" },
  { icon: RefreshCcw, text: "Easy 7-Day Returns" },
  { isLogo: true, text: "UPI" },
  { isLogo: true, text: "VISA" },
  { isLogo: true, text: "RuPay" },
  { isLogo: true, text: "Mastercard" },
  { isLogo: true, text: "COD Available" },
];

export function TrustMarquee() {
  return (
    <div className="flex overflow-hidden bg-beige py-3 border-y border-obsidian/10">
      <div className="flex animate-marquee whitespace-nowrap">
        {/* Render twice for continuous loop */}
        {[...Array(2)].map((_, arrayIndex) => (
          <div key={`marquee-array-${arrayIndex}`} className="flex items-center gap-12 mx-6">
            {TRUST_ITEMS.map((item, i) => (
              <div key={`${arrayIndex}-${i}`} className="flex items-center gap-2 text-obsidian/70">
                {item.icon ? (
                  <>
                    <item.icon className="h-4 w-4 text-champagne-dark" />
                    <span className="text-[11px] font-medium uppercase tracking-[0.2em]">{item.text}</span>
                  </>
                ) : (
                  <span className="text-[12px] font-bold tracking-widest opacity-60 uppercase">{item.text}</span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

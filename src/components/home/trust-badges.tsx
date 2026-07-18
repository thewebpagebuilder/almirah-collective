import { BadgeCheck, Lock, RotateCcw, ShieldCheck } from "lucide-react";

const PAYMENTS = ["UPI", "VISA", "RuPay", "MC", "COD"];

export function TrustBadges() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] uppercase tracking-[0.14em] text-obsidian/70">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-champagne-dark" /> 100% Authentic
        </span>
        <span className="hidden text-obsidian/20 sm:inline">·</span>
        <span className="inline-flex items-center gap-1.5">
          <Lock className="h-4 w-4 text-champagne-dark" /> Secure Checkout
        </span>
        <span className="hidden text-obsidian/20 sm:inline">·</span>
        <span className="inline-flex items-center gap-1.5">
          <RotateCcw className="h-4 w-4 text-champagne-dark" /> Easy 7-Day Returns
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-obsidian">
          <BadgeCheck className="h-4 w-4 text-champagne-dark" /> We accept
        </span>
        {PAYMENTS.map((p) => (
          <span
            key={p}
            className="rounded border border-obsidian/15 bg-pearl px-2 py-1 text-[9px] font-semibold tracking-wide text-obsidian/70"
          >
            {p}
          </span>
        ))}
      </div>
    </div>
  );
}

import Link from "next/link";
import { MagneticButton } from "@/components/ui/magnetic-button";

type Props = { searchParams: Promise<{ order?: string }> };

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { order } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-5 pt-32 md:pt-36 text-center">
      <p className="text-[10px] uppercase tracking-[0.3em] text-champagne-dark">
        Order confirmed
      </p>
      <h1 className="mt-4 font-serif text-3xl md:text-5xl">Thank you</h1>
      <p className="mt-4 text-sm leading-relaxed text-obsidian/60">
        Your order{" "}
        <span className="font-medium text-obsidian">{order || "has been placed"}</span>{" "}
        is being packed with care in Bengaluru. A confirmation note is on its way.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <MagneticButton href="/account">Track in Account</MagneticButton>
        <MagneticButton href="/shop" variant="secondary">
          Continue Shopping
        </MagneticButton>
      </div>
    </div>
  );
}

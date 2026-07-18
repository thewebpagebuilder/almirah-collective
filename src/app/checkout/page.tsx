"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { BRAND } from "@/lib/catalog";
import { formatCurrency, freeShippingProgress } from "@/lib/utils";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { RazorpayIntegration } from "@/components/checkout/razorpay-integration";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: user?.user_metadata?.full_name || "",
    email: user?.email || "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/account/login?redirect=/checkout");
    }
  }, [user, authLoading, router]);

  const progress = freeShippingProgress(subtotal, BRAND.freeShippingThreshold);
  const shipping = progress.remaining > 0 ? 299 : 0;
  const total = subtotal + shipping;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!items.length) return;
    
    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      setError("Please enter a valid 10-digit Indian mobile number");
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            size: i.size,
            color: i.color,
          })),
          address: {
            line1: form.line1,
            line2: form.line2,
            city: form.city,
            state: form.state,
            postalCode: form.postalCode,
            country: "India",
          },
        }),
      });
      const data = (await res.json()) as {
        orderNumber?: string;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      
      setPendingOrder(data.orderNumber ?? null);
      setShowPayment(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  function handlePaymentSuccess() {
    setShowPayment(false);
    clearCart();
    router.push(`/checkout/success?order=`);
  }

  function handlePaymentClose() {
    setShowPayment(false);
    setError("Payment was cancelled. You can try again.");
  }

  if (items.length === 0) {
    return (
<div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-5 pt-32 md:pt-36 text-center">
        <h1 className="font-serif text-3xl">Your bag is empty</h1>
        <MagneticButton href="/shop" className="mt-8">
          Continue Shopping
        </MagneticButton>
      </div>
  );
}

  return (
    <>
    
      {showPayment && (
        <RazorpayIntegration
          amount={total}
          email={form.email}
          phone={form.phone}
          name={form.name}
          orderId={pendingOrder || undefined}
          onSuccess={handlePaymentSuccess}
          onClose={handlePaymentClose}
        />
      )}
    <div className="mx-auto grid max-w-[1200px] gap-12 px-5 pb-24 pt-32 md:pt-36 md:grid-cols-2 md:px-8">
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-champagne-dark">
          Secure checkout
        </p>
        <h1 className="mt-2 font-serif text-4xl">Checkout</h1>
        <p className="mt-2 text-sm text-obsidian/50">
          Brand-styled checkout · Almirah Collective
        </p>

        <form onSubmit={onSubmit} className="mt-10 space-y-5">
          <fieldset className="space-y-4">
            <legend className="text-[11px] uppercase tracking-[0.2em] text-obsidian/50">
              Contact
            </legend>
            <input
              required
              placeholder="Full name"
              className="w-full border border-obsidian/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-champagne"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              required
              type="email"
              placeholder="Email"
              className="w-full border border-obsidian/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-champagne"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              placeholder="Phone"
              className="w-full border border-obsidian/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-champagne"
              pattern="[6-9]\d{9}"
              title="10 digit Indian mobile number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-[11px] uppercase tracking-[0.2em] text-obsidian/50">
              Shipping address
            </legend>
            <input
              required
              placeholder="Address line 1"
              className="w-full border border-obsidian/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-champagne"
              value={form.line1}
              onChange={(e) => setForm({ ...form, line1: e.target.value })}
            />
            <input
              placeholder="Address line 2"
              className="w-full border border-obsidian/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-champagne"
              value={form.line2}
              onChange={(e) => setForm({ ...form, line2: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                required
                placeholder="City"
                className="border border-obsidian/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-champagne"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
              <input
                required
                placeholder="State"
                className="border border-obsidian/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-champagne"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
            </div>
            <input
              required
              placeholder="Postal code"
              className="w-full border border-obsidian/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-champagne"
              value={form.postalCode}
              onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
            />
          </fieldset>

          {error && <p className="text-sm text-red-700">{error}</p>}

          <MagneticButton type="submit" className="w-full" disabled={loading}>
            {loading ? "Placing order…" : `Pay ${formatCurrency(total)}`}
          </MagneticButton>
          <p className="text-center text-xs text-obsidian/40">
            Demo checkout · no real payment processed
          </p>
        </form>
      </div>

      <aside className="h-fit border border-obsidian/10 bg-beige/40 p-6 md:sticky md:top-28 md:p-8">
        <h2 className="font-serif text-2xl">Order summary</h2>
        <ul className="mt-6 space-y-4">
          {items.map((item) => (
            <li
              key={`${item.productId}-${item.size}-${item.color}`}
              className="flex gap-3"
            >
              <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-beige">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <div className="flex-1">
                <p className="font-serif text-base leading-tight">{item.name}</p>
                <p className="text-xs text-obsidian/50">
                  {[item.color, item.size, `Qty ${item.quantity}`]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <p className="text-sm">{formatCurrency(item.price * item.quantity)}</p>
            </li>
          ))}
        </ul>
        <div className="mt-6 space-y-2 border-t border-obsidian/10 pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-obsidian/50">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-obsidian/50">Shipping</span>
            <span>{shipping === 0 ? "Complimentary" : formatCurrency(shipping)}</span>
          </div>
          <div className="flex justify-between border-t border-obsidian/10 pt-3 font-medium">
            <span>Total</span>
            <span className="font-serif text-2xl">{formatCurrency(total)}</span>
          </div>
        </div>
        <Link
          href="/shop"
          className="mt-6 block text-center text-[11px] uppercase tracking-[0.2em] text-obsidian/50 hover:text-obsidian"
        >
          Edit bag
        </Link>
      </aside>
    </div>
    </>
  );
}

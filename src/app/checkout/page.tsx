"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { BRAND } from "@/lib/catalog";
import { formatCurrency, freeShippingProgress, cn } from "@/lib/utils";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { RazorpayIntegration } from "@/components/checkout/razorpay-integration";

export default function CheckoutPage() {
  const { items, subtotal, finalSubtotal, appliedDiscount, discountCodeStr, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [fetchingPincode, setFetchingPincode] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  const [form, setForm] = useState({
    name: user?.user_metadata?.full_name || "",
    email: user?.email || "",
    phoneCode: "+91",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });

  async function handlePincodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setForm({ ...form, postalCode: val });
    
    if (val.length === 6 && /^\d+$/.test(val)) {
      setFetchingPincode(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${val}`);
        const data = await res.json();
        if (data && data[0] && data[0].Status === "Success") {
          const postOffice = data[0].PostOffice[0];
          setForm(prev => ({
            ...prev,
            city: postOffice.District,
            state: postOffice.State
          }));
        }
      } catch (err) {
        // ignore errors and let user type manually
      } finally {
        setFetchingPincode(false);
      }
    }
  }

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/account/login?redirect=/checkout");
    }
  }, [user, authLoading, router]);

  const progress = freeShippingProgress(finalSubtotal, BRAND.freeShippingThreshold);
  const shipping = progress.remaining > 0 ? 299 : 0;
  const total = finalSubtotal + shipping;

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
          phone: `${form.phoneCode}${form.phone}`,
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
            country: form.country,
          },
          discountCode: appliedDiscount ? discountCodeStr : undefined,
        }),
      });
      const data = (await res.json()) as {
        orderNumber?: string;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      
      setPendingOrder(data.orderNumber ?? null);
      
      if (paymentMethod === "cod") {
        clearCart();
        router.push(`/checkout/success?order=${data.orderNumber || ""}`);
      } else {
        setShowPayment(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  function handlePaymentSuccess() {
    setShowPayment(false);
    clearCart();
    router.push(`/checkout/success?order=${pendingOrder || ""}`);
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
            <div className="flex w-full border border-obsidian/15 bg-transparent focus-within:border-champagne">
              <select 
                className="bg-transparent px-3 py-3 text-sm outline-none border-r border-obsidian/15 text-obsidian/80 appearance-none cursor-pointer"
                value={form.phoneCode}
                onChange={(e) => setForm({ ...form, phoneCode: e.target.value })}
              >
                <option value="+91">🇮🇳 +91</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+44">🇬🇧 +44</option>
                <option value="+61">🇦🇺 +61</option>
                <option value="+971">🇦🇪 +971</option>
              </select>
              <input
                placeholder="Phone"
                className="w-full bg-transparent px-4 py-3 text-sm outline-none"
                pattern="\d{7,15}"
                title="Valid phone number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-[11px] uppercase tracking-[0.2em] text-obsidian/50">
              Shipping address
            </legend>
            <div className="w-full relative">
              <select
                required
                className="w-full border border-obsidian/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-champagne appearance-none cursor-pointer"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
              >
                <option value="India">India</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Australia">Australia</option>
                <option value="United Arab Emirates">United Arab Emirates</option>
              </select>
            </div>
            <div className="relative">
              <input
                required
                placeholder="Postal code / Pincode"
                className="w-full border border-obsidian/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-champagne"
                value={form.postalCode}
                onChange={handlePincodeChange}
              />
              {fetchingPincode && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 border-2 border-obsidian/20 border-t-obsidian rounded-full animate-spin" />
              )}
            </div>
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
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-[11px] uppercase tracking-[0.2em] text-obsidian/50">
              Payment Method
            </legend>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={cn(
                  "cursor-pointer border px-4 py-3 text-center text-sm transition-colors",
                  paymentMethod === "razorpay"
                    ? "border-obsidian bg-obsidian text-pearl"
                    : "border-obsidian/15 bg-transparent hover:border-obsidian/40"
                )}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="razorpay"
                  checked={paymentMethod === "razorpay"}
                  onChange={() => setPaymentMethod("razorpay")}
                  className="sr-only"
                />
                Razorpay
              </label>
              <label
                className={cn(
                  "cursor-pointer border px-4 py-3 text-center text-sm transition-colors",
                  paymentMethod === "cod"
                    ? "border-obsidian bg-obsidian text-pearl"
                    : "border-obsidian/15 bg-transparent hover:border-obsidian/40"
                )}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="sr-only"
                />
                Cash on Delivery
              </label>
            </div>
          </fieldset>

          {error && <p className="text-sm text-red-700">{error}</p>}

          <MagneticButton type="submit" className="w-full" disabled={loading}>
            {loading ? "Placing order…" : paymentMethod === "cod" ? "Place Order" : `Pay ${formatCurrency(total)}`}
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
          {appliedDiscount && (
            <div className="flex justify-between text-green-700">
              <span>Discount ({discountCodeStr})</span>
              <span>-{formatCurrency(subtotal - finalSubtotal)}</span>
            </div>
          )}
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

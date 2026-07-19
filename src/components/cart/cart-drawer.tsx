"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { BRAND } from "@/lib/catalog";
import { cn, formatCurrency, freeShippingProgress } from "@/lib/utils";
import { MagneticButton } from "@/components/ui/magnetic-button";

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    subtotal,
  } = useCart();

  const progress = freeShippingProgress(subtotal, BRAND.freeShippingThreshold);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-[70] bg-obsidian/40 backdrop-blur-sm transition-opacity duration-400",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={closeCart}
        aria-hidden={!isOpen}
      />
      <aside
        className={cn(
          "fixed right-0 top-0 z-[80] flex h-full w-full max-w-md flex-col bg-pearl shadow-[-20px_0_60px_rgba(11,11,12,0.15)] transition-transform duration-500 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between border-b border-obsidian/10 px-6 py-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-obsidian/40">
              Your selection
            </p>
            <h2 className="font-serif text-2xl text-obsidian">Cart</h2>
          </div>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="rounded-full p-2 hover:bg-beige"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-obsidian/8 px-6 py-4">
          <div className="h-1 overflow-hidden rounded-full bg-beige">
            <div
              className="h-full bg-champagne transition-all duration-500"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-obsidian/60">
            {progress.remaining > 0
              ? `Add ${formatCurrency(progress.remaining)} more for complimentary shipping`
              : "You've unlocked complimentary shipping"}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="font-serif text-xl text-obsidian">Your cart is empty</p>
              <p className="mt-2 text-sm text-obsidian/50">
                Discover quiet luxury pieces crafted for presence.
              </p>
              <MagneticButton href="/shop" className="mt-8" onClick={closeCart}>
                Explore Collections
              </MagneticButton>
            </div>
          ) : (
            <ul className="space-y-6">
              {items.map((item) => (
                <li
                  key={`${item.productId}-${item.size}-${item.color}`}
                  className="flex gap-4"
                >
                  <div className="relative h-28 w-[88px] shrink-0 overflow-hidden bg-beige">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="88px"
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <div>
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={closeCart}
                          className="font-serif text-lg leading-tight text-obsidian hover:text-champagne-dark"
                        >
                          {item.name}
                        </Link>
                        <p className="mt-1 text-xs text-obsidian/50">
                          {[item.size].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          removeItem(item.productId, item.size, item.color)
                        }
                        className="text-obsidian/30 hover:text-obsidian"
                        aria-label="Remove item"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center border border-obsidian/15">
                        <button
                          type="button"
                          className="p-2 hover:bg-beige"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.quantity - 1,
                              item.size,
                              item.color,
                            )
                          }
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          type="button"
                          className="p-2 hover:bg-beige"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.quantity + 1,
                              item.size,
                              item.color,
                            )
                          }
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-sm font-medium">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-obsidian/10 px-6 py-5">
            <div className="mb-2 flex items-center justify-between rounded-sm border border-champagne/40 bg-champagne/10 px-3 py-2 text-xs text-obsidian/70">
              <span>Complete the look — add a top before free shipping.</span>
            </div>
            <div className="mb-3 flex items-center justify-between rounded-sm border border-dashed border-obsidian/25 px-3 py-2 text-xs">
              <span className="text-obsidian/60">First order? Use code</span>
              <span className="font-mono font-semibold tracking-widest text-obsidian">
                {BRAND.discountCode}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-[0.2em] text-obsidian/50">
                Subtotal
              </span>
              <span className="font-serif text-2xl">{formatCurrency(subtotal)}</span>
            </div>
            <p className="mt-1 text-xs text-obsidian/40">
              Taxes and shipping calculated at checkout
            </p>
            <MagneticButton href="/checkout" className="mt-5 w-full" onClick={closeCart}>
              Proceed to Checkout
            </MagneticButton>
            <button
              type="button"
              onClick={closeCart}
              className="mt-3 w-full text-center text-[11px] uppercase tracking-[0.2em] text-obsidian/50 hover:text-obsidian"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

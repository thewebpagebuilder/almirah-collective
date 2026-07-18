"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, Search, ShoppingBag, User, X, ChevronDown } from "lucide-react";
import { CATEGORIES, BRAND } from "@/lib/catalog";
import { useCart } from "@/context/cart-context";
import { cn } from "@/lib/utils";
import { AnnouncementBar } from "@/components/layout/announcement-bar";

export function Header() {
  const { itemCount, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled || mobileOpen
            ? "bg-pearl/95 backdrop-blur-md shadow-[0_1px_0_rgba(11,11,12,0.06)]"
            : "bg-transparent",
        )}
      >
        <AnnouncementBar />
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 md:h-20 md:px-8">
          <div className="flex items-center gap-3 md:hidden">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
              className="p-2 text-obsidian"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            <div
              className="relative"
              onMouseEnter={() => setMegaOpen(true)}
              onMouseLeave={() => setMegaOpen(false)}
            >
              <button
                type="button"
                className="flex items-center gap-1 text-[11px] uppercase tracking-[0.2em] text-obsidian/80 transition hover:text-obsidian"
              >
                Shop <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <div
                className={cn(
                  "absolute left-0 top-full pt-4 transition-all duration-300",
                  megaOpen
                    ? "pointer-events-auto opacity-100 translate-y-0"
                    : "pointer-events-none opacity-0 -translate-y-2",
                )}
              >
                <div className="grid w-[720px] grid-cols-3 gap-1 border border-obsidian/10 bg-pearl p-6 shadow-[0_24px_80px_rgba(11,11,12,0.12)]">
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/shop/${cat.slug}`}
                      className="group rounded-sm px-3 py-3 transition hover:bg-beige"
                    >
                      <p className="font-serif text-base text-obsidian group-hover:text-champagne-dark">
                        {cat.name}
                      </p>
                      <p className="mt-1 text-[11px] leading-relaxed text-obsidian/50 line-clamp-2">
                        {cat.description}
                      </p>
                    </Link>
                  ))}
                  <Link
                    href="/shop"
                    className="col-span-3 mt-2 border-t border-obsidian/10 pt-4 text-center text-[11px] uppercase tracking-[0.2em] text-champagne-dark"
                  >
                    View all collections →
                  </Link>
                </div>
              </div>
            </div>
            <Link
              href="/lookbook"
              className="text-[11px] uppercase tracking-[0.2em] text-obsidian/80 hover:text-obsidian"
            >
              Lookbook
            </Link>
            <Link
              href="/about"
              className="text-[11px] uppercase tracking-[0.2em] text-obsidian/80 hover:text-obsidian"
            >
              About
            </Link>
          </nav>

          <Link href="/" className="absolute left-1/2 -translate-x-1/2 text-center">
            <span className="font-serif text-xl tracking-[0.08em] text-obsidian md:text-2xl">
              {BRAND.name}
            </span>
          </Link>

          <div className="flex items-center gap-1 md:gap-2">
            <Link
              href="/shop"
              aria-label="Search"
              className="hidden p-2 text-obsidian/80 hover:text-obsidian sm:block"
            >
              <Search className="h-4 w-4" />
            </Link>
            <Link
              href="/account"
              aria-label="Account"
              className="p-2 text-obsidian/80 hover:text-obsidian"
            >
              <User className="h-4 w-4" />
            </Link>
            <button
              type="button"
              aria-label="Open cart"
              onClick={openCart}
              className="relative p-2 text-obsidian/80 hover:text-obsidian"
            >
              <ShoppingBag className="h-4 w-4" />
              {itemCount > 0 && (
                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-champagne px-1 text-[9px] font-medium text-obsidian">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay menu */}
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-pearl transition-transform duration-500 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <span className="font-serif text-xl tracking-[0.08em]">{BRAND.name}</span>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="p-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-col gap-1 overflow-y-auto px-6 pb-12 pt-4">
          <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-obsidian/40">
            Collections
          </p>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/shop/${cat.slug}`}
              onClick={() => setMobileOpen(false)}
              className="border-b border-obsidian/8 py-3.5 font-serif text-2xl text-obsidian"
            >
              {cat.name}
            </Link>
          ))}
          <div className="mt-8 flex flex-col gap-4 text-[12px] uppercase tracking-[0.2em] text-obsidian/70">
            <Link href="/lookbook" onClick={() => setMobileOpen(false)}>
              Lookbook
            </Link>
            <Link href="/about" onClick={() => setMobileOpen(false)}>
              About
            </Link>
            <Link href="/contact" onClick={() => setMobileOpen(false)}>
              Contact
            </Link>
            <Link href="/account" onClick={() => setMobileOpen(false)}>
              Account
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}

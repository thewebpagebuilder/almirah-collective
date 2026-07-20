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
                <div className="flex w-[800px] border border-obsidian/10 bg-pearl shadow-[0_24px_80px_rgba(11,11,12,0.12)]">
                  {/* Men Column */}
                  <div className="flex-1 p-8 border-r border-obsidian/5">
                    <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-obsidian/60">
                      Men
                    </h3>
                    <div className="flex flex-col gap-2">
                      <Link href="/shop/mens-wear" className="group block py-2">
                        <p className="font-serif text-lg text-obsidian group-hover:text-champagne-dark transition-colors">
                          Men's Wear
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-obsidian/50">
                          Curated menswear merging classic silhouettes with modern textures.
                        </p>
                      </Link>
                    </div>
                  </div>

                  {/* Women Column */}
                  <div className="flex-[1.5] p-8 border-r border-obsidian/5">
                    <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-obsidian/60">
                      Women
                    </h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                      {[
                        { slug: "indian-casuals", name: "Indian Casuals", desc: "Everyday ethnic elegance." },
                        { slug: "dresses", name: "Dresses", desc: "Flowing silhouettes for any occasion." },
                        { slug: "co-ord-sets", name: "Co-ord Sets", desc: "Effortlessly matched separates." },
                        { slug: "blouses-tops", name: "Blouses & Tops", desc: "Versatile tops with detailed accents." },
                        { slug: "casual-bottom-wear", name: "Casual Bottom Wear", desc: "Comfortable and chic lower wear." },
                        { slug: "party-wear", name: "Party Wear", desc: "Statement pieces for evening glamour." },
                        { slug: "active-wear", name: "Active-Wear", desc: "Performance wear meeting high fashion." },
                      ].map((cat) => (
                        <Link key={cat.slug} href={`/shop/${cat.slug}`} className="group block py-2">
                          <p className="font-serif text-[15px] text-obsidian group-hover:text-champagne-dark transition-colors">
                            {cat.name}
                          </p>
                          <p className="mt-1 text-[10px] leading-relaxed text-obsidian/40 line-clamp-1">
                            {cat.desc}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Images Column */}
                  <div className="flex-1 flex flex-col p-4 gap-4 bg-beige/30">
                    <Link href="/shop" className="relative flex-1 group overflow-hidden">
                      <div className="absolute inset-0 bg-obsidian/10 group-hover:bg-transparent transition-colors z-10" />
                      <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600&auto=format&fit=crop" alt="Editorial" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute bottom-3 left-3 z-20">
                        <p className="text-pearl text-xs uppercase tracking-widest font-medium">New Arrivals</p>
                      </div>
                    </Link>
                    <Link href="/lookbook" className="relative flex-1 group overflow-hidden">
                      <div className="absolute inset-0 bg-obsidian/10 group-hover:bg-transparent transition-colors z-10" />
                      <img src="https://zscukxpafikmszrqwodc.supabase.co/storage/v1/object/public/product-images/product_8_0.png" alt="Lookbook" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute bottom-3 left-3 z-20">
                        <p className="text-pearl text-xs uppercase tracking-widest font-medium">Lookbook</p>
                      </div>
                    </Link>
                  </div>
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

          <Link href="/" className="absolute left-1/2 -translate-x-1/2 text-center flex items-center justify-center gap-2 md:gap-3">
            <img src="/images/logo.png" alt="Logo" className="h-8 w-auto md:h-10 object-contain mix-blend-multiply" />
            <span className="font-serif text-xl tracking-[0.08em] text-obsidian md:text-2xl mt-1">
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

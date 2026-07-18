"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";

/**
 * Wraps storefront chrome (header, footer, cart, WhatsApp).
 * The Admin CRM has its own dark full-bleed layout, so storefront chrome
 * is hidden there to keep both views clean and error-free.
 */
export function StorefrontChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) {
    return <>{children}</>;
  }
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <CartDrawer />
      <WhatsAppFloat />
    </>
  );
}

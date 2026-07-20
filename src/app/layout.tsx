import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { StorefrontChrome } from "@/components/layout/storefront-chrome";
import { Providers } from "@/components/providers";
import { BRAND } from "@/lib/catalog";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${BRAND.name} — ${BRAND.tagline}`,
    template: `%s · ${BRAND.name}`,
  },
  icons: {
    icon: "/images/logo.png",
  },
  description:
    "Your wardrobe, handpicked for you. Shop curated branded fashion — DKNY, Puma, W, Kook N Keech and more. Genuine pieces from ₹399, shipped pan-India.",
  keywords: [
    "Almirah Collective",
    "curated fashion India",
    "branded clothing",
    "Indian casuals",
    "DKNY",
    "Puma",
    BRAND.name,
  ],
  openGraph: {
    title: BRAND.name,
    description: BRAND.tagline,
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-pearl font-sans text-obsidian antialiased">
        <Providers>
          <StorefrontChrome>{children}</StorefrontChrome>
        </Providers>
        <Analytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: BRAND.name,
              description: BRAND.tagline,
              email: BRAND.email,
              telephone: BRAND.phone,
              address: {
                "@type": "PostalAddress",
                streetAddress: BRAND.address,
                addressCountry: "IN",
              },
            }),
          }}
        />
      </body>
    </html>
  );
}

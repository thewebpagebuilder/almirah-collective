import Link from "next/link";
import { BRAND, CATEGORIES } from "@/lib/catalog";

export function Footer() {
  return (
    <footer className="border-t border-obsidian/10 bg-obsidian text-pearl">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-16 md:grid-cols-4 md:px-8 md:py-20">
        <div className="md:col-span-1">
          <p className="font-serif text-2xl tracking-[0.06em]">{BRAND.name}</p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-pearl/60">
            {BRAND.tagline}. Handpicked branded fashion, packed with care from
            Bengaluru.
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-champagne">Shop</p>
          <ul className="mt-5 space-y-2.5">
            {CATEGORIES.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/shop/${c.slug}`}
                  className="text-sm text-pearl/70 transition hover:text-pearl"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-champagne">Collective</p>
          <ul className="mt-5 space-y-2.5 text-sm text-pearl/70">
            <li>
              <Link href="/about" className="hover:text-pearl">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/lookbook" className="hover:text-pearl">
                Lookbook
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-pearl">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/account" className="hover:text-pearl">
                Account
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-pearl">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-pearl">
                Terms
              </Link>
            </li>
            <li>
              <Link href="/shipping-returns" className="hover:text-pearl">
                Shipping & Returns
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-champagne">Contact Us</p>
          <ul className="mt-5 space-y-2.5 text-sm text-pearl/70">
            <li>
              <a href={`mailto:${BRAND.email}`} className="hover:text-pearl">
                {BRAND.email}
              </a>
            </li>
            <li>
              <a href={`tel:${BRAND.phone.replace(/\s/g, "")}`} className="hover:text-pearl">
                {BRAND.phone}
              </a>
            </li>
            <li>
              <a
                href={`https://wa.me/${BRAND.whatsapp.replace("+", "")}`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-pearl"
              >
                Connect on WhatsApp
              </a>
            </li>
            <li className="pt-2 leading-relaxed text-pearl/50">{BRAND.address}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-pearl/10">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-3 px-5 py-6 text-[11px] text-pearl/40 md:flex-row md:px-8">
          <p>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 md:justify-end">
            <Link href="/privacy" className="transition hover:text-pearl">
              Privacy
            </Link>
            <Link href="/terms" className="transition hover:text-pearl">
              Terms
            </Link>
            <Link href="/shipping-returns" className="transition hover:text-pearl">
              Shipping & Returns
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

import type { Metadata } from "next";
import { BRAND } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms of Service for ${BRAND.name}.`,
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-32 md:px-8 md:pt-36">
      <p className="text-[10px] uppercase tracking-[0.3em] text-champagne-dark">
        Legal
      </p>
      <h1 className="mt-3 font-serif text-3xl md:text-4xl lg:text-5xl">Terms of Service</h1>
      <p className="mt-4 text-sm text-obsidian/60">
        Effective date: January 1, 2026
      </p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-obsidian/70">
        <section>
          <h2 className="font-serif text-2xl text-obsidian">1. About us</h2>
          <p className="mt-3">
            {BRAND.name} is a curated fashion store by {BRAND.founder}, run from {BRAND.address}.
            By using this website, browsing products, contact forms, account access, or placing an
            order, you agree to these Terms.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-obsidian">2. Products and availability</h2>
          <p className="mt-3">
            Many pieces are unique, one-off, or limited-quantity curated items. Product images,
            colors, and fit may vary slightly across devices and fabrics. If an item becomes
            unavailable after purchase, affected orders may be cancelled and refunded.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-obsidian">3. Pricing, offers, and errors</h2>
          <p className="mt-3">
            Prices are shown in INR and may change without notice. Discount codes may change or
            expire at any time. If there is a pricing, listing, or technical error, we may refuse
            or cancel the relevant order.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-obsidian">4. Payments</h2>
          <p className="mt-3">
            All payments must be successfully authorized before dispatch. We use secure third-party
            payment gateways. By making a payment, you confirm you are authorized to use the chosen
            payment method.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-obsidian">5. Accounts</h2>
          <p className="mt-3">
            You are responsible for keeping your account credentials secure and for all activity
            under your account. We may restrict or suspend access for misuse, fraud, abuse, or
            violation of these Terms.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-obsidian">6. Intellectual property</h2>
          <p className="mt-3">
            Website content, product presentation, images, text, design, graphics, and branding
            belong to {BRAND.name} or their respective owners and may not be copied or reused
            without permission.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-obsidian">7. Liability</h2>
          <p className="mt-3">
            The website and its content are provided on an "as is" and "as available" basis. To the
            maximum extent permitted by law, {BRAND.name} is not liable for indirect or
            consequential damages arising from website use, delays, or availability issues.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-obsidian">8. Contact</h2>
          <p className="mt-3">
            For any questions regarding these Terms, contact:
            <br />
            {BRAND.email} · {BRAND.phone}
          </p>
        </section>
      </div>
    </div>
  );
}

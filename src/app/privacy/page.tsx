import type { Metadata } from "next";
import { BRAND } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy Policy for ${BRAND.name}.`,
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-32 md:px-8 md:pt-36">
      <p className="text-[10px] uppercase tracking-[0.3em] text-champagne-dark">
        Legal
      </p>
      <h1 className="mt-3 font-serif text-3xl md:text-4xl lg:text-5xl">Privacy Policy</h1>
      <p className="mt-4 text-sm text-obsidian/60">
        Effective date: January 1, 2026 · Last updated for {BRAND.name}
      </p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-obsidian/70">
        <section>
          <h2 className="font-serif text-2xl text-obsidian">1. What we collect</h2>
          <p className="mt-3">
            When you shop, subscribe, create an account, or contact us, we may collect:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Name, email address, phone number, and shipping address</li>
            <li>Order details, cart activity, and customer support messages</li>
            <li>Device/browser details and basic analytics information</li>
            <li>Account authentication identifiers when using Supabase Auth</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-obsidian">2. How we use your information</h2>
          <p className="mt-3">
            We use your information to process orders, provide customer service, send order
            updates, improve the shopping experience, protect the store, and share relevant
            product or service communication where allowed.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-obsidian">3. Payments and service providers</h2>
          <p className="mt-3">
            Payments are processed through secure payment providers. We do not store your card
            or UPI credentials on our servers. We may use trusted third-party tools for
            payments, analytics, authentication, email/SMS delivery, courier, and hosting.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-obsidian">4. Cookies and analytics</h2>
          <p className="mt-3">
            We may use cookies and similar technologies for cart persistence, site analytics,
            and performance measurement. You can manage cookies through your browser settings.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-obsidian">5. Sharing of information</h2>
          <p className="mt-3">
            We do not sell your personal information. We may share limited details only with
            service providers needed to run the store, deliver orders, provide support, and
            meet legal obligations.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-obsidian">6. Data security</h2>
          <p className="mt-3">
            We take reasonable technical and organizational measures to keep your information
            secure. No internet transmission is completely guaranteed, but we work to keep all
            systems tightly protected.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-obsidian">7. Your choices</h2>
          <p className="mt-3">
            You may request access, correction, or deletion of your personal data where
            applicable. You can also unsubscribe from marketing emails at any time.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-obsidian">8. Contact</h2>
          <p className="mt-3">
            For privacy questions, contact:
            <br />
            {BRAND.email} · {BRAND.phone}
          </p>
        </section>
      </div>
    </div>
  );
}

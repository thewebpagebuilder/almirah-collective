"use client";

import { useState } from "react";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { BRAND, FAQS } from "@/lib/catalog";
import { MagneticButton } from "@/components/ui/magnetic-button";

export default function ContactPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Failed");
      setStatus("done");
      setMessage(data.message || "Sent");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Error");
    }
  }

  return (
    <div className="mx-auto max-w-[1440px] px-5 pb-24 pt-32 md:pt-36 md:px-8">
      <div className="max-w-2xl">
        <p className="text-[10px] uppercase tracking-[0.3em] text-champagne-dark">
          Concierge
        </p>
        <h1 className="mt-3 font-serif text-3xl md:text-4xl lg:text-5xl">Contact Us</h1>
        <p className="mt-4 text-sm leading-relaxed text-obsidian/60">
          Size questions, styling help, or order support — Ameena typically responds
          within 24 hours. WhatsApp is fastest.
        </p>
      </div>

      <div className="mt-14 grid gap-12 lg:grid-cols-2">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              required
              placeholder="Name"
              className="border border-obsidian/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-champagne"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              required
              type="email"
              placeholder="Email"
              className="border border-obsidian/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-champagne"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <input
            placeholder="Phone / WhatsApp"
            className="w-full border border-obsidian/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-champagne"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <input
            required
            placeholder="Subject"
            className="w-full border border-obsidian/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-champagne"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
          />
          <textarea
            required
            rows={6}
            placeholder="How may we assist?"
            className="w-full resize-y border border-obsidian/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-champagne"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
          <MagneticButton type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Sending…" : "Send Message"}
          </MagneticButton>
          {message && (
            <p
              className={`text-sm ${status === "error" ? "text-red-700" : "text-obsidian/60"}`}
            >
              {message}
            </p>
          )}
        </form>

        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: Mail,
                label: "Email",
                value: BRAND.email,
                href: `mailto:${BRAND.email}`,
              },
              {
                icon: Phone,
                label: "Phone",
                value: BRAND.phone,
                href: `tel:${BRAND.phone.replace(/\s/g, "")}`,
              },
              {
                icon: MessageCircle,
                label: "WhatsApp",
                value: "Chat with Ameena",
                href: `https://wa.me/${BRAND.whatsapp.replace("+", "")}`,
              },
              {
                icon: MapPin,
                label: "Studio",
                value: BRAND.address,
                href: "#map",
              },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="border border-obsidian/10 bg-beige/40 p-5 transition hover:border-champagne/50"
              >
                <item.icon className="h-4 w-4 text-champagne-dark" />
                <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-obsidian/40">
                  {item.label}
                </p>
                <p className="mt-1 text-sm leading-relaxed">{item.value}</p>
              </a>
            ))}
          </div>

          <div
            id="map"
            className="relative flex h-64 items-center justify-center overflow-hidden border border-obsidian/10 bg-beige"
          >
            <div className="absolute inset-0 opacity-40">
              <div className="h-full w-full bg-[radial-gradient(circle_at_30%_40%,#c9a96e33,transparent_50%),radial-gradient(circle_at_70%_60%,#0b0b0c11,transparent_45%)]" />
              <div className="absolute inset-8 border border-dashed border-obsidian/15" />
            </div>
            <div className="relative text-center">
              <MapPin className="mx-auto h-6 w-6 text-champagne-dark" />
              <p className="mt-2 font-serif text-xl">Bengaluru Studio</p>
              <p className="mt-1 max-w-xs text-xs text-obsidian/50">{BRAND.address}</p>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-24 max-w-3xl">
        <p className="text-[10px] uppercase tracking-[0.3em] text-champagne-dark">
          FAQ
        </p>
        <h2 className="mt-3 font-serif text-3xl md:text-4xl">Common questions</h2>
        <div className="mt-8 border-t border-obsidian/10">
          {FAQS.map((faq, i) => (
            <div key={faq.q} className="border-b border-obsidian/10">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between py-5 text-left"
              >
                <span className="pr-6 font-serif text-lg md:text-xl">{faq.q}</span>
                <span className="text-obsidian/40">{openFaq === i ? "−" : "+"}</span>
              </button>
              {openFaq === i && (
                <p className="pb-5 text-sm leading-relaxed text-obsidian/65">{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

"use client";

import { useState } from "react";
import { MagneticButton } from "@/components/ui/magnetic-button";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Failed");
      setStatus("done");
      setMessage(data.message || "Welcome to the inner circle.");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <form onSubmit={onSubmit} className="relative mx-auto max-w-xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className="flex-1 border border-obsidian/20 bg-transparent px-5 py-4 text-sm outline-none transition focus:border-champagne"
          aria-label="Email for newsletter"
        />
        <MagneticButton type="submit" variant="gold" disabled={status === "loading"}>
          {status === "loading" ? "Joining…" : "Subscribe"}
        </MagneticButton>
      </div>
      {message && (
        <p
          className={`mt-3 text-sm ${status === "error" ? "text-red-700" : "text-obsidian/60"}`}
          role="status"
        >
          {message}
        </p>
      )}
    </form>
  );
}

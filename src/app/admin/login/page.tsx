"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MagneticButton } from "@/components/ui/magnetic-button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Login failed");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-5 py-24">
      <div className="text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-champagne-dark">
          Restricted Area
        </p>
        <h1 className="mt-3 font-serif text-3xl">Admin Portal</h1>
      </div>

      <form onSubmit={onSubmit} className="mt-10 space-y-4">
        <input
          required
          type="email"
          placeholder="Admin Email"
          className="w-full border border-obsidian/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-champagne"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          required
          type="password"
          placeholder="Admin Password"
          className="w-full border border-obsidian/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-champagne"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <MagneticButton type="submit" className="w-full" disabled={loading}>
          {loading ? "Authenticating..." : "Access Dashboard"}
        </MagneticButton>
      </form>
    </div>
  );
}

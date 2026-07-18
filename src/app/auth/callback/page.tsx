"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [message, setMessage] = useState("");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    async function handleCallback() {
      try {
        const url = new URL(window.location.href);

        // OAuth error passed by provider
        const errParam =
          url.searchParams.get("error_description") ||
          url.searchParams.get("error");
        if (errParam) {
          throw new Error(decodeURIComponent(errParam.replace(/\+/g, " ")));
        }

        // PKCE flow: ?code=... — verifier lives in browser storage
        const code = url.searchParams.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          window.location.assign("/account");
          return;
        }

        // Implicit flow fallback: #access_token=...
        if (window.location.hash.includes("access_token")) {
          const { data, error } = await supabase.auth.getSession();
          if (error) throw error;
          if (data.session) {
            window.location.assign("/account");
            return;
          }
        }

        throw new Error("Missing authorization code. Please try signing in again.");
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Authentication failed");
        setStatus("error");
      }
    }

    handleCallback();
  }, []);

  if (status === "error") {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-4 px-5 text-center">
        <h1 className="font-serif text-3xl">Sign-in issue</h1>
        <p className="text-sm text-red-600">{message}</p>
        <Link
          href="/account/login"
          className="text-[11px] uppercase tracking-[0.2em] text-champagne-dark"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-5">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-obsidian border-t-transparent" />
      <p className="text-sm text-obsidian/55">Completing sign-in…</p>
    </div>
  );
}

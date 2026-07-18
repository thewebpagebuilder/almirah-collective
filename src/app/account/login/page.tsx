"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { supabase } from "@/lib/supabase";

type Mode = "login" | "signup" | "reset";

function friendlyAuthError(message: string) {
  const msg = message.toLowerCase();
  if (msg.includes("invalid login credentials")) {
    return "Email or password is incorrect. If you just created an account, confirm your email first.";
  }
  if (msg.includes("email not confirmed")) {
    return "Your email is not confirmed yet. Please open the confirmation email, or resend it below.";
  }
  if (msg.includes("user already") || msg.includes("already registered")) {
    return "This email already has an account. Please sign in instead, or reset your password.";
  }
  if (msg.includes("password")) {
    return "Password must be at least 6 characters.";
  }
  return message || "Authentication failed. Please try again.";
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email]);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session) {
        window.location.assign("/account");
        return;
      }
      setCheckingSession(false);
    });
    return () => {
      active = false;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!normalizedEmail) throw new Error("Please enter your email address.");

      if (mode === "reset") {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          normalizedEmail,
          { redirectTo: `${window.location.origin}/account/login` },
        );
        if (resetError) throw resetError;
        setSuccess("Password reset link sent. Please check your email inbox.");
        return;
      }

      if (mode === "signup") {
        if (!name.trim()) throw new Error("Please enter your full name.");
        if (password.length < 6) throw new Error("Password must be at least 6 characters.");

        const { data, error: signUpError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: { full_name: name.trim() },
            emailRedirectTo: `${window.location.origin}/account`,
          },
        });
        if (signUpError) throw signUpError;

        // Supabase can return an existing user with no identities when signups are duplicated.
        if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
          setMode("login");
          setError("This email already exists. Please sign in, or use 'Forgot password'.");
          return;
        }

        setMode("login");
        setSuccess(
          "Account created. If email confirmation is enabled, open the confirmation email before signing in.",
        );
        return;
      }

      if (password.length < 6) throw new Error("Password must be at least 6 characters.");

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      if (signInError) throw signInError;
      if (!data.session) {
        throw new Error("Sign-in did not create a session. Please confirm your email and try again.");
      }

      setSuccess("Signed in successfully. Redirecting...");
      window.location.assign("/account");
    } catch (err) {
      setError(friendlyAuthError(err instanceof Error ? err.message : "Authentication failed"));
    } finally {
      setLoading(false);
    }
  }

  async function resendConfirmation() {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (!normalizedEmail) throw new Error("Enter your email address first.");
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: normalizedEmail,
        options: { emailRedirectTo: `${window.location.origin}/account` },
      });
      if (resendError) throw resendError;
      setSuccess("Confirmation email resent. Please check your inbox/spam folder.");
    } catch (err) {
      setError(friendlyAuthError(err instanceof Error ? err.message : "Could not resend email"));
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { access_type: "offline", prompt: "consent" },
        },
      });
      if (googleError) throw googleError;
    } catch (err) {
      setError(friendlyAuthError(err instanceof Error ? err.message : "Google sign-in failed"));
      setLoading(false);
    }
  }

  function switchMode(next: Mode) {
    setMode(next);
    setError("");
    setSuccess("");
  }

  if (checkingSession) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center px-5 pt-32">
        <p className="text-sm text-obsidian/50">Checking session…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-5 pb-24 pt-32 md:pt-36">
      <p className="text-[10px] uppercase tracking-[0.3em] text-champagne-dark">
        Client access
      </p>
      <h1 className="mt-3 font-serif text-3xl md:text-4xl">
        {mode === "signup" ? "Create account" : mode === "reset" ? "Reset password" : "Sign in"}
      </h1>
      <p className="mt-2 text-sm text-obsidian/55">
        Secure client portal. Track orders, save favorites, and manage your profile.
      </p>

      {/* Google Sign In */}
      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={loading}
        className="mt-8 flex w-full items-center justify-center gap-3 border border-obsidian/20 bg-white px-4 py-3 text-sm font-medium text-obsidian transition hover:border-obsidian hover:shadow-sm disabled:opacity-60"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        {loading ? "Please wait…" : "Continue with Google"}
      </button>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-obsidian/15" />
        <span className="text-[10px] uppercase tracking-[0.2em] text-obsidian/35">
          or continue with email
        </span>
        <div className="h-px flex-1 bg-obsidian/15" />
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {mode === "signup" && (
          <input
            required
            placeholder="Full name"
            autoComplete="name"
            className="w-full border border-obsidian/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-champagne"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}
        <input
          required
          type="email"
          placeholder="Email address"
          autoComplete="email"
          className="w-full border border-obsidian/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-champagne"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {mode !== "reset" && (
          <input
            required
            type="password"
            placeholder="Password (min 6 characters)"
            minLength={6}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            className="w-full border border-obsidian/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-champagne"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}

        {error && (
          <div className="rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-xs leading-relaxed text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-sm border border-green-200 bg-green-50 px-3 py-2 text-xs leading-relaxed text-green-700">
            {success}
          </div>
        )}

        <MagneticButton type="submit" className="w-full" disabled={loading}>
          {loading
            ? "Please wait…"
            : mode === "signup"
              ? "Create account"
              : mode === "reset"
                ? "Send reset link"
                : "Sign in"}
        </MagneticButton>
      </form>

      <div className="mt-5 flex flex-col items-center gap-2 text-sm">
        {mode === "login" && (
          <button
            type="button"
            onClick={() => switchMode("reset")}
            className="text-obsidian/55 hover:text-obsidian"
          >
            Forgot password?
          </button>
        )}
        {mode === "login" && (
          <button
            type="button"
            onClick={resendConfirmation}
            disabled={loading}
            className="text-xs text-obsidian/45 hover:text-obsidian"
          >
            Resend confirmation email
          </button>
        )}
        <button
          type="button"
          onClick={() => switchMode(mode === "signup" ? "login" : "signup")}
          className="text-obsidian/55 hover:text-obsidian"
        >
          {mode === "signup"
            ? "Already a client? Sign in"
            : "New here? Create an account"}
        </button>
        {mode === "reset" && (
          <button
            type="button"
            onClick={() => switchMode("login")}
            className="text-obsidian/55 hover:text-obsidian"
          >
            Back to sign in
          </button>
        )}
      </div>

      <Link
        href="/"
        className="mt-4 text-center text-[11px] uppercase tracking-[0.2em] text-obsidian/35"
      >
        Back to store
      </Link>
    </div>
  );
}

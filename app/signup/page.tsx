"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export default function SignupPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (!displayName.trim()) {
      setError("Enter a display name.");
      setLoading(false);
      return;
    }

    const loginRedirectUrl = typeof window === "undefined" ? undefined : `${window.location.origin}/login`;

    const { data, error: signUpError } = await supabaseBrowser.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: loginRedirectUrl,
        data: {
          display_name: displayName.trim(),
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push("/");
      return;
    }

    setMessage("Check your email for a confirmation link to finish signing up.");
    setLoading(false);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#f8f5f2] via-[#faf8f6] to-[#f0ebe6] text-[#2c2c2c]">
      <div className="absolute inset-0 opacity-60">
        <div className="absolute -left-20 top-16 h-80 w-80 rounded-full bg-[#d4af37]/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[#8b4049]/12 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center px-6 py-12">
        <div className="flex w-full flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[#8b4049]">So DiVino</p>
            <h1 className="text-3xl font-semibold">Create your account</h1>
            <p className="text-[#6b6b6b]">
              Sign up to define your cellar, capture your taste profile, and use the new recommendation workspace.
            </p>
            <div className="flex items-center gap-2 text-sm text-[#6b6b6b]">
              <span className="h-2 w-2 rounded-full bg-[#d4af37]" />
              <span>Secure Supabase authentication</span>
            </div>
          </div>

          <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white/80 p-8 shadow-xl shadow-black/5 backdrop-blur">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="text-sm text-[#6b6b6b]">Display name</label>
                <input
                  className="mt-2 w-full rounded-2xl border border-[#e4dcd2] bg-white px-4 py-3 text-sm shadow-inner focus:border-[#8b4049] focus:outline-none"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm text-[#6b6b6b]">Email</label>
                <input
                  className="mt-2 w-full rounded-2xl border border-[#e4dcd2] bg-white px-4 py-3 text-sm shadow-inner focus:border-[#8b4049] focus:outline-none"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm text-[#6b6b6b]">Password</label>
                <input
                  className="mt-2 w-full rounded-2xl border border-[#e4dcd2] bg-white px-4 py-3 text-sm shadow-inner focus:border-[#8b4049] focus:outline-none"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}
              {message && <p className="text-sm text-green-600">{message}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-gradient-to-r from-[#8b4049] to-[#6d323a] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#8b4049]/25 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Signing up…" : "Sign up"}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-[#6b6b6b]">
              Already have an account?{" "}
              <Link className="font-semibold text-[#8b4049] underline" href="/login">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

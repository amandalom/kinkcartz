"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/admin/products";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Incorrect password.");
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm rounded-2xl border border-white/10 bg-surface p-8 shadow-2xl"
    >
      <h1 className="font-display text-xl text-white">Admin</h1>
      <p className="mt-1 text-xs text-zinc-500">Store management — not visible to shoppers.</p>
      <input
        type="password"
        autoFocus
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="mt-6 w-full rounded-lg border border-white/10 bg-surface2 px-4 py-3 text-sm text-white placeholder:text-zinc-500"
      />
      {error && <p className="mt-3 text-sm text-accent">{error}</p>}
      <button
        type="submit"
        disabled={loading || !password}
        className="mt-4 w-full rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition hover:bg-accent/90 disabled:opacity-60"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

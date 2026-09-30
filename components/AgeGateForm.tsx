"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function AgeGateForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/";
  const [declined, setDeclined] = useState(false);
  const [loading, setLoading] = useState(false);

  async function confirm() {
    setLoading(true);
    await fetch("/api/age-gate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ next }),
    });
    router.push(next);
    router.refresh();
  }

  if (declined) {
    return (
      <p className="max-w-md text-lg text-zinc-300">
        You must be of legal adult age in your jurisdiction to enter this site.
        Redirecting you away.
      </p>
    );
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-surface p-8 text-center shadow-2xl">
      <h1 className="font-display text-2xl text-white">Age Verification</h1>
      <p className="mt-4 text-sm leading-relaxed text-zinc-400">
        This site contains sexually explicit product content intended for
        adults only. By entering, you confirm you are at least 18 years old
        (or the age of majority in your jurisdiction, if higher) and consent
        to viewing adult material.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          onClick={confirm}
          disabled={loading}
          className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition hover:bg-accent/90 disabled:opacity-60"
        >
          I am 18+ — Enter
        </button>
        <button
          onClick={() => setDeclined(true)}
          className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-zinc-300 transition hover:bg-white/5"
        >
          Leave
        </button>
      </div>
    </div>
  );
}

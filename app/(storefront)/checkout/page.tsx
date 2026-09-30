"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-store";
import { formatCents } from "@/lib/format";
import { Eyebrow } from "@/components/Eyebrow";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clear } = useCart();
  const total = useCart((s) => s.totalCents());
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        shipping: {
          name: form.get("name"),
          address1: form.get("address1"),
          address2: form.get("address2"),
          city: form.get("city"),
          state: form.get("state"),
          zip: form.get("zip"),
          country: form.get("country"),
        },
        items,
      }),
    });

    setSubmitting(false);
    if (!res.ok) {
      setError("Something went wrong. Please try again.");
      return;
    }
    const data = await res.json();
    setOrderId(data.orderId);
    clear();
  }

  if (orderId) {
    return (
      <main className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1 className="font-display text-2xl text-white">Order received</h1>
        <p className="mt-4 text-sm text-zinc-400">
          Reference <span className="text-zinc-200">#{orderId.slice(-8)}</span>. This
          demo does not process payment — no live processor is connected yet.
        </p>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-lg px-6 py-24 text-center">
        <p className="text-zinc-400">Your bag is empty.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <Eyebrow>Final Rite</Eyebrow>
      <h1 className="mt-1 font-display text-2xl text-white">Checkout</h1>
      <p className="mt-2 text-xs text-zinc-500">
        Demo checkout — collects order &amp; shipping details only. No payment is
        captured (see README for wiring a real, adult-friendly processor).
      </p>

      <div className="mt-8 grid grid-cols-1 gap-10 md:grid-cols-2">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="email" type="email" required placeholder="Email"
            className="w-full rounded-lg border border-white/10 bg-surface px-4 py-3 text-sm text-white placeholder:text-zinc-500"
          />
          <input
            name="name" required placeholder="Full name"
            className="w-full rounded-lg border border-white/10 bg-surface px-4 py-3 text-sm text-white placeholder:text-zinc-500"
          />
          <input
            name="address1" required placeholder="Address line 1"
            className="w-full rounded-lg border border-white/10 bg-surface px-4 py-3 text-sm text-white placeholder:text-zinc-500"
          />
          <input
            name="address2" placeholder="Address line 2 (optional)"
            className="w-full rounded-lg border border-white/10 bg-surface px-4 py-3 text-sm text-white placeholder:text-zinc-500"
          />
          <div className="grid grid-cols-3 gap-3">
            <input name="city" required placeholder="City" className="rounded-lg border border-white/10 bg-surface px-4 py-3 text-sm text-white placeholder:text-zinc-500" />
            <input name="state" required placeholder="State" className="rounded-lg border border-white/10 bg-surface px-4 py-3 text-sm text-white placeholder:text-zinc-500" />
            <input name="zip" required placeholder="ZIP" className="rounded-lg border border-white/10 bg-surface px-4 py-3 text-sm text-white placeholder:text-zinc-500" />
          </div>
          <input
            name="country" required defaultValue="United States"
            className="w-full rounded-lg border border-white/10 bg-surface px-4 py-3 text-sm text-white placeholder:text-zinc-500"
          />

          {error && <p className="text-sm text-accent">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition hover:bg-accent/90 disabled:opacity-60"
          >
            {submitting ? "Placing order…" : `Place order — ${formatCents(total)}`}
          </button>
        </form>

        <div className="rounded-xl border border-white/10 bg-surface p-5">
          <h2 className="text-sm uppercase tracking-wide text-zinc-500">Order summary</h2>
          <ul className="mt-4 space-y-3">
            {items.map((item) => (
              <li key={`${item.productId}-${item.variantId ?? ""}`} className="flex justify-between text-sm text-zinc-300">
                <span>{item.name} × {item.quantity}</span>
                <span>{formatCents(item.priceCents * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-white/10 pt-4 text-sm text-white">
            <span>Total</span>
            <span className="font-display text-gold">{formatCents(total)}</span>
          </div>
          <p className="mt-4 text-xs text-zinc-500">
            Billing will appear on your statement as a discreet descriptor, not
            an explicit merchant name.
          </p>
        </div>
      </div>
    </main>
  );
}

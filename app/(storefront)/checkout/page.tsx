"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-store";
import { formatCents } from "@/lib/format";
import { Eyebrow } from "@/components/Eyebrow";
import { PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/lib/payment-methods";
import type { PublicPaymentOption } from "@/lib/payment-settings";

export default function CheckoutPage() {
  const { items, clear } = useCart();
  const total = useCart((s) => s.totalCents());
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  // Cart (and its live totalCents()) gets cleared right after a successful
  // order, so the confirmation screen needs its own frozen copy of the total.
  const [orderTotal, setOrderTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [options, setOptions] = useState<PublicPaymentOption[] | null>(null);
  const [method, setMethod] = useState<PaymentMethod | "">("");
  // Bitcoin payments can't be reversed once sent, so submitting with it
  // selected shows a confirm step instead of placing the order immediately.
  const [btcConfirming, setBtcConfirming] = useState(false);

  function selectMethod(next: PaymentMethod) {
    setMethod(next);
    setBtcConfirming(false);
  }

  useEffect(() => {
    fetch("/api/payment-settings")
      .then((res) => res.json())
      .then((data: { options: PublicPaymentOption[] }) => {
        setOptions(data.options);
        if (data.options.length === 1) setMethod(data.options[0].method);
      })
      .catch(() => setOptions([]));
  }, []);

  const selectedOption = options?.find((o) => o.method === method);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!method) {
      setError("Choose a payment method.");
      return;
    }
    if (method === "bitcoin" && !btcConfirming) {
      setBtcConfirming(true);
      return;
    }
    setSubmitting(true);
    setError(null);

    // multipart, not JSON — Bitcoin orders attach a payment screenshot.
    const formData = new FormData(e.currentTarget);
    formData.set("items", JSON.stringify(items));

    const res = await fetch("/api/checkout", {
      method: "POST",
      body: formData,
    });

    setSubmitting(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error || "Something went wrong. Please try again.");
      return;
    }
    const data = await res.json();
    setOrderTotal(total);
    setOrderId(data.orderId);
    clear();
  }

  if (orderId) {
    return (
      <main className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1 className="font-display text-2xl text-white">Order received</h1>
        <p className="mt-4 text-sm text-zinc-400">
          Reference <span className="text-zinc-200">#{orderId.slice(-8)}</span>.
        </p>
        {method === "bitcoin" ? (
          <div className="mt-6 rounded-xl border border-white/10 bg-surface p-5 text-left">
            <h2 className="text-sm uppercase tracking-wide text-zinc-500">Pay via Bitcoin</h2>
            <p className="mt-3 break-all rounded-lg bg-surface2 px-4 py-3 font-mono text-sm text-white">
              {selectedOption?.bitcoinAddress || "Address not configured — contact support."}
            </p>
            <p className="mt-3 text-sm text-zinc-300">
              We&apos;ve got your screenshot for the{" "}
              <strong className="text-gold">{formatCents(orderTotal)}</strong> payment — we&apos;ll
              double-check it and get your order packed and shipped as soon as it&apos;s confirmed.
              We&apos;ll email you a link to check your order status once we&apos;ve reviewed it.
            </p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-zinc-400">
            We&apos;re reviewing your order now — once that&apos;s done we&apos;ll email you a
            secure magic link with{" "}
            {method && PAYMENT_METHOD_LABELS[method as PaymentMethod]} payment instructions. Your
            order ships as soon as we&apos;ve confirmed the payment came through.
          </p>
        )}
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
        Pick a payment method below. We don&apos;t run cards — pay directly, and we confirm once
        it arrives.
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

          <div className="space-y-2 pt-2">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Payment method</p>
            {options === null && <p className="text-sm text-zinc-500">Loading payment options…</p>}
            {options?.length === 0 && (
              <p className="text-sm text-accent">No payment methods are configured yet — contact the shop.</p>
            )}
            <div className="space-y-2">
              {options?.map((opt) => (
                <label
                  key={opt.method}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm ${
                    method === opt.method
                      ? "border-accent bg-surface2 text-white"
                      : "border-white/10 bg-surface text-zinc-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={opt.method}
                    checked={method === opt.method}
                    onChange={() => selectMethod(opt.method)}
                  />
                  {PAYMENT_METHOD_LABELS[opt.method]}
                </label>
              ))}
            </div>

            {method === "bitcoin" && selectedOption && (
              <div className="rounded-lg border border-white/10 bg-surface2 p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Bitcoin address</p>
                <p className="mt-2 break-all font-mono text-sm text-white">
                  {selectedOption.bitcoinAddress || "Address not configured — contact support."}
                </p>
              </div>
            )}
            {method && method !== "bitcoin" && (
              <p className="text-xs text-zinc-500">
                Once you place the order, we&apos;ll review it and send a secure magic link to
                your email with {PAYMENT_METHOD_LABELS[method as PaymentMethod]} payment
                instructions.
              </p>
            )}
          </div>

          {error && <p className="text-sm text-accent">{error}</p>}

          {btcConfirming ? (
            <div className="space-y-3 rounded-lg border border-accent bg-surface2 p-4">
              <p className="text-sm text-white">One last thing before we lock this in</p>
              <p className="text-sm text-zinc-300">
                Send <strong className="text-gold">{formatCents(total)}</strong> in BTC to the
                address above, then come back here with a screenshot of the completed transaction
                — that&apos;s how we confirm it went through, since there&apos;s no card for us to
                charge. Bitcoin can&apos;t be undone once it&apos;s sent, so give the address one
                more look before you do.
              </p>
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wide text-zinc-500">
                  Payment screenshot
                </label>
                <input
                  type="file"
                  name="paymentProof"
                  accept="image/png,image/jpeg,image/webp"
                  required
                  className="w-full rounded-lg border border-white/10 bg-surface px-3 py-2.5 text-xs text-zinc-300 file:mr-3 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-1.5 file:text-xs file:font-medium file:text-white file:hover:bg-accent/90"
                />
              </div>
              <p className="text-xs text-zinc-500">
                We&apos;ll ship your order as soon as we&apos;ve confirmed the payment came
                through.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setBtcConfirming(false)}
                  className="flex-1 rounded-full border border-white/15 px-6 py-3 text-sm text-zinc-300 hover:bg-white/5"
                >
                  Go back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition hover:bg-accent/90 disabled:opacity-60"
                >
                  {submitting ? "Placing order…" : "Confirm & place order"}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition hover:bg-accent/90 disabled:opacity-60"
            >
              {submitting ? "Placing order…" : `Place order — ${formatCents(total)}`}
            </button>
          )}
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

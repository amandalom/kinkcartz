import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/format";
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/lib/payment-methods";
import { updateOrderStatus, sendPaymentDetails } from "@/lib/admin-actions";
import { buildPaymentDetailsSnapshot, getPaymentSettings } from "@/lib/payment-settings";

export const dynamic = "force-dynamic";

const STATUSES = ["pending_payment", "paid", "fulfilled", "cancelled"] as const;

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [order, paymentSettings] = await Promise.all([
    prisma.order.findUnique({ where: { id }, include: { items: true } }),
    getPaymentSettings(),
  ]);

  if (!order) notFound();

  const method = order.paymentMethod as PaymentMethod;
  const details = order.paymentDetails
    ? (JSON.parse(order.paymentDetails) as {
        address?: string | null;
        handle?: string | null;
        name?: string | null;
      })
    : {};
  const defaults = buildPaymentDetailsSnapshot(method, paymentSettings);
  const defaultDestination = details.address ?? details.handle ?? defaults.address ?? defaults.handle ?? "";
  const defaultAccountName = details.name ?? defaults.name ?? "";

  const field =
    "w-full rounded-lg border border-white/10 bg-surface2 px-4 py-3 text-sm text-white placeholder:text-zinc-500";
  const label = "text-xs uppercase tracking-wide text-zinc-500";

  return (
    <div>
      <Link href="/admin/orders" className="text-xs text-zinc-500 hover:text-gold">
        ← Back to orders
      </Link>

      <div className="mt-3 flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl text-white">Order #{order.id.slice(-8)}</h1>
          <p className="mt-1 text-sm text-zinc-500">{order.createdAt.toLocaleString()}</p>
        </div>
        <form action={updateOrderStatus.bind(null, order.id)} className="flex items-center gap-2">
          <select
            name="status"
            defaultValue={order.status}
            className="rounded-md border border-white/10 bg-surface2 px-2 py-1 text-xs text-white"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-md border border-white/15 px-2 py-1 text-xs text-zinc-300 hover:bg-white/5"
          >
            Save status
          </button>
        </form>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <section className="rounded-xl border border-white/10 bg-surface p-5">
            <h2 className={label}>Customer</h2>
            <p className="mt-2 text-sm text-white">{order.shippingName}</p>
            <p className="text-sm text-zinc-400">{order.email}</p>
            <p className="mt-3 text-sm text-zinc-400">
              {order.shippingAddress1}
              {order.shippingAddress2 ? `, ${order.shippingAddress2}` : ""}
              <br />
              {order.shippingCity}, {order.shippingState} {order.shippingZip}
              <br />
              {order.shippingCountry}
            </p>
          </section>

          <section className="rounded-xl border border-white/10 bg-surface p-5">
            <h2 className={label}>Items</h2>
            <ul className="mt-3 space-y-2">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between text-sm text-zinc-300">
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>{formatCents(item.priceCents * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between border-t border-white/10 pt-4 text-sm text-white">
              <span>Total</span>
              <span className="font-display text-gold">{formatCents(order.totalCents)}</span>
            </div>
          </section>

          {order.paymentProofKey && (
            <section className="rounded-xl border border-white/10 bg-surface p-5">
              <h2 className={label}>Payment proof</h2>
              <a
                href={`/api/admin/payment-proofs/${order.paymentProofKey}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-sm text-accent hover:underline"
              >
                View screenshot
              </a>
            </section>
          )}
        </div>

        <section className="rounded-xl border border-white/10 bg-surface p-5">
          <h2 className={label}>Payment details</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Pick the method and destination this order should pay to, then send — that&apos;s
            what emails the customer their magic link.
          </p>

          <form action={sendPaymentDetails.bind(null, order.id)} className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <label className={label}>Payment method</label>
              <select name="method" defaultValue={method} className={field}>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {PAYMENT_METHOD_LABELS[m]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className={label}>{method === "bitcoin" ? "BTC address" : "Handle"}</label>
              <input
                name="destination"
                defaultValue={defaultDestination}
                placeholder={method === "bitcoin" ? "bc1q..." : "Handle or link"}
                className={`${field} font-mono`}
              />
            </div>
            {method !== "bitcoin" && (
              <div className="space-y-1.5">
                <label className={label}>Account name (optional)</label>
                <input
                  name="accountName"
                  defaultValue={defaultAccountName}
                  placeholder="Name on the account"
                  className={field}
                />
              </div>
            )}
            <button
              type="submit"
              className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-white hover:bg-accent/90"
            >
              {order.paymentDetailsSentAt ? "Resend to customer" : "Send to customer"}
            </button>
            <p className="text-xs text-zinc-600">
              {order.paymentDetailsSentAt
                ? `Last sent ${order.paymentDetailsSentAt.toLocaleString()}`
                : "Not sent to customer yet"}
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}

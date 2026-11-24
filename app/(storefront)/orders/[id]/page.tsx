import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/format";
import { verifyOrderToken } from "@/lib/order-link";
import { PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/lib/payment-methods";
import { Eyebrow } from "@/components/Eyebrow";

export const dynamic = "force-dynamic";

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { id } = await params;
  const { token } = await searchParams;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) notFound();

  const valid = await verifyOrderToken(order.id, token, order.magicTokenHash, order.magicTokenExpiresAt);
  if (!valid) {
    return (
      <main className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1 className="font-display text-2xl text-white">Link invalid or expired</h1>
        <p className="mt-4 text-sm text-zinc-400">
          This order link isn&apos;t valid. Check your email for the most recent link, or contact
          support with your order number.
        </p>
      </main>
    );
  }

  const method = order.paymentMethod as PaymentMethod;
  const label = PAYMENT_METHOD_LABELS[method] ?? order.paymentMethod;
  const details = order.paymentDetails
    ? (JSON.parse(order.paymentDetails) as {
        address?: string | null;
        handle?: string | null;
        name?: string | null;
      })
    : {};
  const destination = details.address ?? details.handle;

  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <Eyebrow>Order #{order.id.slice(-8)}</Eyebrow>
      <h1 className="mt-1 font-display text-2xl text-white">Payment instructions</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Status: <span className="text-zinc-200">{order.status.replace(/_/g, " ")}</span>
      </p>

      <div className="mt-6 rounded-xl border border-white/10 bg-surface p-5">
        <h2 className="text-sm uppercase tracking-wide text-zinc-500">Pay via {label}</h2>
        {destination ? (
          <>
            <p className="mt-3 break-all rounded-lg bg-surface2 px-4 py-3 font-mono text-sm text-white">
              {destination}
            </p>
            {details.name && (
              <p className="mt-2 text-xs text-zinc-400">
                Account name on file: <span className="text-zinc-200">{details.name}</span> —
                confirm this matches before sending.
              </p>
            )}
          </>
        ) : (
          <p className="mt-3 text-sm text-accent">
            Payment destination isn&apos;t configured yet — contact support with your order number.
          </p>
        )}
        <p className="mt-4 text-sm text-zinc-300">
          Send <strong className="text-gold">{formatCents(order.totalCents)}</strong>
          {method === "bitcoin" ? " worth of BTC" : ""}, and include order{" "}
          <strong>#{order.id.slice(-8)}</strong> in the note/memo if possible.
        </p>
        <p className="mt-4 text-xs text-zinc-500">
          We&apos;ll mark this order confirmed and get it shipped once payment arrives — no
          further action needed if you&apos;ve already sent it.
        </p>
      </div>

      <div className="mt-8">
        <h2 className="text-sm uppercase tracking-wide text-zinc-500">Order summary</h2>
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
      </div>
    </main>
  );
}

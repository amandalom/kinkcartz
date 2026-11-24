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
  searchParams: Promise<{ token?: string; proofUploaded?: string; proofError?: string }>;
}) {
  const { id } = await params;
  const { token, proofUploaded, proofError } = await searchParams;

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
          Once you&apos;ve sent payment, upload a screenshot or receipt below — that&apos;s how we
          confirm it went through and get your order shipped.
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-white/10 bg-surface p-5">
        <h2 className="text-sm uppercase tracking-wide text-zinc-500">Payment proof</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Upload a screenshot or receipt of your payment. This is what we use to confirm your
          order — we can&apos;t mark it paid without it.
        </p>

        {proofUploaded && (
          <p className="mt-3 text-sm text-gold">
            Received — thanks! We&apos;ll confirm it and get your order moving.
          </p>
        )}
        {proofError && <p className="mt-3 text-sm text-accent">{proofError}</p>}
        {order.paymentProofKey && !proofUploaded && (
          <p className="mt-3 text-sm text-zinc-300">
            We already have a file on record for this order. Uploading another replaces it.
          </p>
        )}

        <form
          action={`/api/orders/${order.id}/proof`}
          method="POST"
          encType="multipart/form-data"
          className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <input type="hidden" name="token" value={token} />
          <input
            type="file"
            name="proof"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            required
            className="flex-1 text-sm text-zinc-300 file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:text-white file:hover:bg-white/15"
          />
          <button
            type="submit"
            className="rounded-full bg-accent px-6 py-2 text-sm font-medium text-white hover:bg-accent/90"
          >
            Upload
          </button>
        </form>
        <p className="mt-2 text-xs text-zinc-600">JPEG, PNG, WEBP, or PDF — up to 5MB.</p>
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

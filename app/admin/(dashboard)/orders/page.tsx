import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/format";
import { PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/lib/payment-methods";
import { updateOrderStatus } from "@/lib/admin-actions";

export const dynamic = "force-dynamic";

const STATUSES = ["pending_payment", "paid", "fulfilled", "cancelled"] as const;

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div>
        <h1 className="font-display text-2xl text-white">Orders</h1>
        <p className="mt-1 text-sm text-zinc-500">{orders.length} total</p>
      </div>

      <div className="mt-8 overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Proof</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {orders.map((order) => {
              const method = order.paymentMethod as PaymentMethod;
              const label = PAYMENT_METHOD_LABELS[method] ?? order.paymentMethod;

              return (
                <tr key={order.id} className="bg-surface/40 align-top">
                  <td className="px-4 py-3 text-white">
                    <Link href={`/admin/orders/${order.id}`} className="hover:text-gold">
                      #{order.id.slice(-8)}
                    </Link>
                    <div className="mt-1 text-xs text-zinc-500">
                      {order.createdAt.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">
                    {order.email}
                    <div className="mt-1 text-xs text-zinc-500">
                      {order.items.length} item{order.items.length === 1 ? "" : "s"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">
                    {label}
                    <div className="mt-1 text-xs text-zinc-600">
                      {order.paymentDetailsSentAt
                        ? `Sent ${order.paymentDetailsSentAt.toLocaleDateString()}`
                        : "Not sent yet"}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {order.paymentProofKey ? (
                      <a
                        href={`/api/admin/payment-proofs/${order.paymentProofKey}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-accent hover:underline"
                      >
                        View screenshot
                      </a>
                    ) : (
                      <span className="text-xs text-zinc-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-200">{formatCents(order.totalCents)}</td>
                  <td className="px-4 py-3">
                    <form
                      action={updateOrderStatus.bind(null, order.id)}
                      className="flex items-center gap-2"
                    >
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
                        Save
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="whitespace-nowrap text-xs text-accent hover:underline"
                    >
                      Payment details →
                    </Link>
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

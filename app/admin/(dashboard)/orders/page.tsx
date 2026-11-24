import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/format";
import { PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/lib/payment-methods";
import { updateOrderStatus, sendPaymentDetails } from "@/lib/admin-actions";
import { buildPaymentDetailsSnapshot, getPaymentSettings } from "@/lib/payment-settings";

export const dynamic = "force-dynamic";

const STATUSES = ["pending_payment", "paid", "fulfilled", "cancelled"] as const;

export default async function AdminOrdersPage() {
  const [orders, paymentSettings] = await Promise.all([
    prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
    }),
    getPaymentSettings(),
  ]);

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
              <th className="px-4 py-3">Payment details</th>
              <th className="px-4 py-3">Proof</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {orders.map((order) => {
              const method = order.paymentMethod as PaymentMethod;
              const label = PAYMENT_METHOD_LABELS[method] ?? order.paymentMethod;
              const details = order.paymentDetails
                ? (JSON.parse(order.paymentDetails) as {
                    address?: string | null;
                    handle?: string | null;
                    name?: string | null;
                  })
                : {};
              const defaults = buildPaymentDetailsSnapshot(method, paymentSettings);
              const defaultDestination =
                details.address ?? details.handle ?? defaults.address ?? defaults.handle ?? "";
              const defaultAccountName = details.name ?? defaults.name ?? "";

              return (
                <tr key={order.id} className="bg-surface/40 align-top">
                  <td className="px-4 py-3 text-white">
                    #{order.id.slice(-8)}
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
                  <td className="px-4 py-3 text-zinc-300">{label}</td>
                  <td className="px-4 py-3 text-zinc-400">
                    <form
                      action={sendPaymentDetails.bind(null, order.id)}
                      className="flex flex-col gap-1.5"
                    >
                      <input
                        name="destination"
                        defaultValue={defaultDestination}
                        placeholder={method === "bitcoin" ? "BTC address" : "Handle"}
                        className="w-44 rounded-md border border-white/10 bg-surface2 px-2 py-1 font-mono text-xs text-white placeholder:text-zinc-600"
                      />
                      {method !== "bitcoin" && (
                        <input
                          name="accountName"
                          defaultValue={defaultAccountName}
                          placeholder="Account name (optional)"
                          className="w-44 rounded-md border border-white/10 bg-surface2 px-2 py-1 text-xs text-white placeholder:text-zinc-600"
                        />
                      )}
                      <button
                        type="submit"
                        className="w-fit whitespace-nowrap rounded-md border border-white/15 px-2 py-1 text-xs text-zinc-300 hover:bg-white/5"
                      >
                        {order.paymentDetailsSentAt ? "Resend" : "Send"}
                      </button>
                    </form>
                    <p className="mt-1 text-xs text-zinc-600">
                      {order.paymentDetailsSentAt
                        ? `Sent to customer ${order.paymentDetailsSentAt.toLocaleString()}`
                        : "Not sent to customer yet"}
                    </p>
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

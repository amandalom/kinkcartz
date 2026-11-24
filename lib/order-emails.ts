import { formatCents } from "@/lib/format";
import { PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/lib/payment-methods";

type OrderEmailOrder = {
  id: string;
  email: string;
  shippingName: string;
  totalCents: number;
  paymentMethod: string;
};

export function buildCustomerOrderEmail(params: {
  order: OrderEmailOrder;
  orderLink: string;
  bitcoinAddress?: string | null;
  accountName?: string | null;
}) {
  const method = params.order.paymentMethod as PaymentMethod;
  const label = PAYMENT_METHOD_LABELS[method] ?? method;
  const amount = formatCents(params.order.totalCents);
  const shortId = params.order.id.slice(-8);

  const nameNote = params.accountName
    ? ` Double-check the account name shown — it should say <strong>${params.accountName}</strong>.`
    : "";
  const paymentBlock =
    method === "bitcoin"
      ? `Send <strong>${amount}</strong> worth of BTC to:<br/><code>${
          params.bitcoinAddress ?? "(address not configured yet — contact support)"
        }</code>`
      : `We'll confirm your <strong>${label}</strong> payment destination on the secure page linked below.${nameNote}`;

  const html = `
    <p>Hi ${params.order.shippingName},</p>
    <p>Thanks for your order <strong>#${shortId}</strong> — total <strong>${amount}</strong>, paying via <strong>${label}</strong>.</p>
    <p>${paymentBlock}</p>
    <p><a href="${params.orderLink}">View your order &amp; payment instructions</a></p>
    <p>Once we receive payment we'll mark your order confirmed and get it shipped — no action needed if you've already sent it.</p>
  `.trim();

  const text = [
    `Thanks for your order #${shortId} — total ${amount}, paying via ${label}.`,
    `View your order & payment instructions: ${params.orderLink}`,
  ].join("\n");

  return {
    to: params.order.email,
    subject: `Your kinkcartz order #${shortId} — payment instructions`,
    html,
    text,
  };
}

export function buildAdminNotificationEmail(params: {
  order: OrderEmailOrder & { items: { name: string; quantity: number }[] };
  adminOrdersLink: string;
}) {
  const method = params.order.paymentMethod as PaymentMethod;
  const label = PAYMENT_METHOD_LABELS[method] ?? method;
  const amount = formatCents(params.order.totalCents);
  const shortId = params.order.id.slice(-8);
  const itemsList = params.order.items.map((i) => `${i.quantity} × ${i.name}`).join(", ");

  const html = `
    <p>New order <strong>#${shortId}</strong> — <strong>${amount}</strong> via <strong>${label}</strong>.</p>
    <p>Customer: ${params.order.email}</p>
    <p>Items: ${itemsList}</p>
    <p><a href="${params.adminOrdersLink}">Review in admin dashboard</a></p>
  `.trim();

  const text = [
    `New order #${shortId} — ${amount} via ${label}.`,
    `Customer: ${params.order.email}`,
    `Items: ${itemsList}`,
    `Review: ${params.adminOrdersLink}`,
  ].join("\n");

  return {
    subject: `New order #${shortId} — ${label} — ${amount}`,
    html,
    text,
  };
}

export function buildProofUploadedEmail(params: {
  order: OrderEmailOrder;
  adminOrderLink: string;
}) {
  const method = params.order.paymentMethod as PaymentMethod;
  const label = PAYMENT_METHOD_LABELS[method] ?? method;
  const amount = formatCents(params.order.totalCents);
  const shortId = params.order.id.slice(-8);

  const html = `
    <p>Payment proof uploaded for order <strong>#${shortId}</strong> — <strong>${amount}</strong> via <strong>${label}</strong>.</p>
    <p>Customer: ${params.order.email}</p>
    <p>The file is attached to this email, and also viewable from the order's admin page.</p>
    <p><a href="${params.adminOrderLink}">Review order #${shortId}</a></p>
  `.trim();

  const text = [
    `Payment proof uploaded for order #${shortId} — ${amount} via ${label}.`,
    `Customer: ${params.order.email}`,
    `File is attached. Review: ${params.adminOrderLink}`,
  ].join("\n");

  return {
    subject: `Payment proof uploaded — order #${shortId}`,
    html,
    text,
  };
}

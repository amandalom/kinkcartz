import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isPaymentMethod } from "@/lib/payment-methods";
import { buildPaymentDetailsSnapshot, getPaymentSettings, isMethodEnabled } from "@/lib/payment-settings";
import { createOrderToken } from "@/lib/order-link";
import { sendEmail } from "@/lib/email";
import { buildAdminNotificationEmail, buildCustomerOrderEmail } from "@/lib/order-emails";
import { savePaymentProof } from "@/lib/payment-proof-storage";

const MAX_PROOF_BYTES = 5 * 1024 * 1024;
const ALLOWED_PROOF_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// STUB: records the order intent and the customer's chosen payment method,
// does NOT capture payment. Wire a real processor here before going live —
// see README. Multipart (not JSON) because Bitcoin orders attach a payment
// screenshot as proof, since there's no automatic blockchain verification.
export async function POST(req: NextRequest) {
  const form = await req.formData();

  const email = String(form.get("email") ?? "");
  const shipping = {
    name: String(form.get("name") ?? ""),
    address1: String(form.get("address1") ?? ""),
    address2: String(form.get("address2") ?? "") || undefined,
    city: String(form.get("city") ?? ""),
    state: String(form.get("state") ?? ""),
    zip: String(form.get("zip") ?? ""),
    country: String(form.get("country") ?? ""),
  };
  const paymentMethod = String(form.get("paymentMethod") ?? "");
  let items: { productId: string; name: string; priceCents: number; quantity: number }[];
  try {
    items = JSON.parse(String(form.get("items") ?? "[]"));
  } catch {
    return NextResponse.json({ error: "Invalid cart data" }, { status: 400 });
  }

  if (!email || !shipping.name || !items.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!isPaymentMethod(paymentMethod)) {
    return NextResponse.json({ error: "Select a payment method" }, { status: 400 });
  }

  const settings = await getPaymentSettings();
  if (!isMethodEnabled(paymentMethod, settings)) {
    return NextResponse.json({ error: "That payment method isn't available" }, { status: 400 });
  }

  let paymentProofKey: string | null = null;
  const proofFile = form.get("paymentProof");
  if (proofFile instanceof File && proofFile.size > 0) {
    if (proofFile.size > MAX_PROOF_BYTES) {
      return NextResponse.json({ error: "Screenshot is larger than 5MB." }, { status: 400 });
    }
    const ext = ALLOWED_PROOF_TYPES[proofFile.type];
    if (!ext) {
      return NextResponse.json({ error: "Screenshot must be a JPEG, PNG, or WEBP image." }, { status: 400 });
    }
    const filename = `${randomUUID()}.${ext}`;
    const buffer = Buffer.from(await proofFile.arrayBuffer());
    paymentProofKey = await savePaymentProof(filename, buffer);
  } else if (paymentMethod === "bitcoin") {
    return NextResponse.json(
      { error: "Please attach a screenshot of your payment before confirming." },
      { status: 400 }
    );
  }

  const totalCents = items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);
  const paymentDetails = buildPaymentDetailsSnapshot(paymentMethod, settings);

  const order = await prisma.order.create({
    data: {
      email,
      shippingName: shipping.name,
      shippingAddress1: shipping.address1,
      shippingAddress2: shipping.address2,
      shippingCity: shipping.city,
      shippingState: shipping.state,
      shippingZip: shipping.zip,
      shippingCountry: shipping.country,
      totalCents,
      paymentMethod,
      paymentDetails: JSON.stringify(paymentDetails),
      paymentProofKey,
      items: {
        create: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          priceCents: i.priceCents,
          quantity: i.quantity,
        })),
      },
    },
    include: { items: true },
  });

  const { token, hash, expiresAt } = await createOrderToken(order.id);
  await prisma.order.update({
    where: { id: order.id },
    data: { magicTokenHash: hash, magicTokenExpiresAt: expiresAt },
  });

  const origin = req.nextUrl.origin;
  const orderLink = `${origin}/orders/${order.id}?token=${token}`;

  // Best-effort notifications — a failed email must never roll back an
  // already-recorded order.
  try {
    const customerEmail = buildCustomerOrderEmail({
      order,
      orderLink,
      bitcoinAddress: paymentMethod === "bitcoin" ? settings.bitcoinAddress : undefined,
    });
    await sendEmail(customerEmail);

    const adminTo = process.env.ADMIN_NOTIFICATION_EMAIL;
    if (adminTo) {
      const adminEmail = buildAdminNotificationEmail({
        order,
        adminOrdersLink: `${origin}/admin/orders`,
      });
      await sendEmail({ ...adminEmail, to: adminTo });
    }
  } catch (err) {
    console.error("[checkout] notification emails failed", err);
  }

  return NextResponse.json({ orderId: order.id });
}

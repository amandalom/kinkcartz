import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyOrderToken } from "@/lib/order-link";
import { savePaymentProof } from "@/lib/payment-proof-storage";
import { sendEmail } from "@/lib/email";
import { buildProofUploadedEmail } from "@/lib/order-emails";

const MAX_PROOF_BYTES = 5 * 1024 * 1024;
const ALLOWED_PROOF_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

// Customer-facing upload from the magic-link order page — lets them attach
// a payment receipt/screenshot after the fact (not just at Bitcoin
// checkout, where it's required upfront). Gated by the same signed token
// as the page itself, not admin auth, since the customer isn't logged in
// to anything.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const form = await req.formData();
  const token = String(form.get("token") ?? "");
  const origin = req.nextUrl.origin;
  const back = (query: string) => NextResponse.redirect(`${origin}/orders/${id}?token=${token}${query}`, 303);

  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const valid = await verifyOrderToken(id, token, order.magicTokenHash, order.magicTokenExpiresAt);
  if (!valid) {
    return back("&proofError=Link invalid or expired");
  }

  const file = form.get("proof");
  if (!(file instanceof File) || file.size === 0) {
    return back("&proofError=Choose a file first");
  }
  if (file.size > MAX_PROOF_BYTES) {
    return back("&proofError=File is larger than 5MB");
  }
  const ext = ALLOWED_PROOF_TYPES[file.type];
  if (!ext) {
    return back("&proofError=Must be a JPEG, PNG, WEBP, or PDF");
  }

  const filename = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const key = await savePaymentProof(filename, buffer);

  await prisma.order.update({ where: { id }, data: { paymentProofKey: key } });

  // Best-effort — a failed email must never roll back an already-saved
  // upload (the file is still visible from the admin order page either way).
  try {
    const adminTo = process.env.ADMIN_NOTIFICATION_EMAIL;
    if (adminTo) {
      const email = buildProofUploadedEmail({
        order,
        adminOrderLink: `${origin}/admin/orders/${id}`,
      });
      await sendEmail({ ...email, to: adminTo, attachments: [{ filename, content: buffer }] });
    }
  } catch (err) {
    console.error("[proof-upload] admin notification email failed", err);
  }

  return back("&proofUploaded=1");
}

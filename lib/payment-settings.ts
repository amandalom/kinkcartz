import type { PaymentSettings } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { PaymentMethod } from "@/lib/payment-methods";

export async function getPaymentSettings(): Promise<PaymentSettings> {
  return prisma.paymentSettings.upsert({
    where: { id: "default" },
    create: { id: "default" },
    update: {},
  });
}

export type PublicPaymentOption = {
  method: PaymentMethod;
  // Only Bitcoin's address is safe/useful to show immediately at checkout;
  // other methods' handles are revealed later via the emailed magic link.
  bitcoinAddress?: string | null;
};

export async function getPublicPaymentOptions(): Promise<PublicPaymentOption[]> {
  const s = await getPaymentSettings();
  const options: PublicPaymentOption[] = [];
  if (s.bitcoinEnabled) options.push({ method: "bitcoin", bitcoinAddress: s.bitcoinAddress });
  if (s.cashappEnabled) options.push({ method: "cashapp" });
  if (s.paypalEnabled) options.push({ method: "paypal" });
  if (s.venmoEnabled) options.push({ method: "venmo" });
  if (s.zelleEnabled) options.push({ method: "zelle" });
  return options;
}

export function isMethodEnabled(method: PaymentMethod, settings: PaymentSettings): boolean {
  switch (method) {
    case "bitcoin":
      return settings.bitcoinEnabled;
    case "cashapp":
      return settings.cashappEnabled;
    case "paypal":
      return settings.paypalEnabled;
    case "venmo":
      return settings.venmoEnabled;
    case "zelle":
      return settings.zelleEnabled;
  }
}

// Default address/handle (+ account-holder name, where that concept
// applies) an admin's per-order "Send payment details" form is pre-filled
// with — not written to the Order until an admin actually sends it, so a
// later edit here can't change what an already-sent order told the
// customer.
export function buildPaymentDetailsSnapshot(
  method: PaymentMethod,
  settings: PaymentSettings
): { address?: string | null; handle?: string | null; name?: string | null } {
  switch (method) {
    case "bitcoin":
      return { address: settings.bitcoinAddress ?? null };
    case "cashapp":
      return { handle: settings.cashappHandle ?? null, name: settings.cashappAccountName ?? null };
    case "paypal":
      return { handle: settings.paypalHandle ?? null, name: settings.paypalAccountName ?? null };
    case "venmo":
      return { handle: settings.venmoHandle ?? null, name: settings.venmoAccountName ?? null };
    case "zelle":
      return { handle: settings.zelleHandle ?? null, name: settings.zelleAccountName ?? null };
  }
}

import { randomUUID } from "node:crypto";
import { hmac, timingSafeEqual } from "@/lib/crypto";

const TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not set");
  return secret;
}

// Domain-separated from the admin session HMAC so a leaked order token
// can't be replayed against anything else that uses the same secret.
function signingInput(orderId: string, token: string): string {
  return `order-link:${orderId}:${token}`;
}

export async function createOrderToken(
  orderId: string
): Promise<{ token: string; hash: string; expiresAt: Date }> {
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + TTL_MS);
  const hash = await hmac(signingInput(orderId, token), getSecret());
  return { token, hash, expiresAt };
}

export async function verifyOrderToken(
  orderId: string,
  token: string | null | undefined,
  storedHash: string | null | undefined,
  expiresAt: Date | null | undefined
): Promise<boolean> {
  if (!token || !storedHash || !expiresAt) return false;
  if (expiresAt.getTime() < Date.now()) return false;
  const expected = await hmac(signingInput(orderId, token), getSecret());
  return timingSafeEqual(expected, storedHash);
}

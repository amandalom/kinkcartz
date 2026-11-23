import { hmac, timingSafeEqual } from "@/lib/crypto";

export const ADMIN_COOKIE = "admin_session";
const TTL_MS = 12 * 60 * 60 * 1000; // 12h

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not set");
  return secret;
}

export async function createSessionToken(): Promise<string> {
  const expiry = Date.now() + TTL_MS;
  const sig = await hmac(String(expiry), getSecret());
  return `${expiry}.${sig}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [expiryStr, sig] = token.split(".");
  const expiry = Number(expiryStr);
  if (!expiry || Number.isNaN(expiry) || expiry < Date.now()) return false;
  const expected = await hmac(expiryStr, getSecret());
  return timingSafeEqual(expected, sig ?? "");
}

export async function checkPassword(candidate: string): Promise<boolean> {
  const correct = process.env.ADMIN_PASSWORD;
  if (!correct) throw new Error("ADMIN_PASSWORD is not set");
  const [a, b] = await Promise.all([hmac(candidate, getSecret()), hmac(correct, getSecret())]);
  return timingSafeEqual(a, b);
}

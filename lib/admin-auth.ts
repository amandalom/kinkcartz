export const ADMIN_COOKIE = "admin_session";
const TTL_MS = 12 * 60 * 60 * 1000; // 12h

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not set");
  return secret;
}

function bufToBase64Url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let str = "";
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Uses Web Crypto (globalThis.crypto.subtle) so the same code runs in
// both the edge proxy and Node.js route handlers/server actions.
async function hmac(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return bufToBase64Url(sig);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
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

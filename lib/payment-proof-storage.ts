import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";

// Deliberately separate from lib/image-storage.ts's "product-images" store:
// that one is served back out through a public URL (same model as product
// photos), but a payment screenshot can show a wallet balance, transaction
// ID, or other account details, so this stays admin-gated — see
// app/api/admin/payment-proofs/[key]/route.ts. Local dev writes outside
// public/ entirely so there's no public static path to it either.
const onNetlify = process.env.NETLIFY === "true";
const STORE_NAME = "payment-proofs";

export async function savePaymentProof(filename: string, buffer: Buffer): Promise<string> {
  if (onNetlify) {
    const { getStore } = await import("@netlify/blobs");
    const store = getStore(STORE_NAME);
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
    await store.set(filename, arrayBuffer);
    return filename;
  }

  const dir = path.join(process.cwd(), "uploads", "payment-proofs");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);
  return filename;
}

export async function readPaymentProof(filename: string): Promise<Buffer | null> {
  if (onNetlify) {
    const { getStore } = await import("@netlify/blobs");
    const store = getStore(STORE_NAME);
    const data = await store.get(filename, { type: "arrayBuffer" });
    return data ? Buffer.from(data) : null;
  }

  try {
    return await readFile(path.join(process.cwd(), "uploads", "payment-proofs", filename));
  } catch {
    return null;
  }
}

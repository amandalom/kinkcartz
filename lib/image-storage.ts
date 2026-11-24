import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";

// Local `next dev` writes straight to disk (public/uploads), same as
// before. On Netlify, the filesystem is read-only/ephemeral at runtime, so
// uploads go to Netlify Blobs instead. NETLIFY=true is only set in
// Netlify's *build* environment, not forwarded into the deployed
// function's runtime — checking it here always came back false in
// production, silently falling through to writeFile() against the
// function's read-only filesystem (crashing with a 500) instead of
// Netlify Blobs. NETLIFY_BLOBS_CONTEXT (what @netlify/blobs itself needs
// to auto-configure) and AWS_LAMBDA_FUNCTION_NAME (set for any Netlify
// Function, Next.js SSR included) are both actually present there.
const onNetlify = Boolean(process.env.NETLIFY_BLOBS_CONTEXT || process.env.AWS_LAMBDA_FUNCTION_NAME);

export async function saveUpload(filename: string, buffer: Buffer): Promise<string> {
  if (onNetlify) {
    const { getStore } = await import("@netlify/blobs");
    const store = getStore("product-images");
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
    await store.set(filename, arrayBuffer);
    return `/api/blob-images/${filename}`;
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  await writeFile(path.join(uploadsDir, filename), buffer);
  return `/uploads/${filename}`;
}

export async function deleteUpload(url: string): Promise<void> {
  if (url.startsWith("/api/blob-images/")) {
    const { getStore } = await import("@netlify/blobs");
    const store = getStore("product-images");
    const filename = url.replace("/api/blob-images/", "");
    await store.delete(filename).catch(() => {});
    return;
  }

  if (url.startsWith("/uploads/")) {
    await unlink(path.join(process.cwd(), "public", url)).catch(() => {});
  }
}

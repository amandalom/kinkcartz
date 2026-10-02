import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";

// Local `next dev` writes straight to disk (public/uploads), same as
// before. On Netlify, the filesystem is read-only/ephemeral at runtime, so
// uploads go to Netlify Blobs instead — auto-detected via the NETLIFY env
// var Netlify sets on every build and function invocation; no manual
// config needed there.
const onNetlify = process.env.NETLIFY === "true";

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

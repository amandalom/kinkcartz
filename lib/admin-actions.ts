"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin-auth";
import { saveUpload, deleteUpload } from "@/lib/image-storage";

async function requireAdmin() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!(await verifySessionToken(token))) {
    redirect("/admin/login");
  }
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  let slug = base || "product";
  let n = 2;
  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (!existing || existing.id === ignoreId) return slug;
    slug = `${base}-${n++}`;
  }
}

const VALID_AUDIENCES = new Set(["all", "sub", "dom", "couples"]);

function readProductForm(formData: FormData) {
  const priceDollars = parseFloat(String(formData.get("price") ?? "0"));
  const audience = String(formData.get("audience") ?? "all");
  return {
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    priceCents: Math.round((Number.isFinite(priceDollars) ? priceDollars : 0) * 100),
    sku: String(formData.get("sku") ?? "").trim(),
    categoryId: String(formData.get("categoryId") ?? ""),
    material: String(formData.get("material") ?? "").trim() || null,
    powerSource: String(formData.get("powerSource") ?? "").trim() || null,
    audience: VALID_AUDIENCES.has(audience) ? audience : "all",
    tags: String(formData.get("tags") ?? "").trim() || null,
    featured: formData.get("featured") === "on",
    active: formData.get("active") === "on",
    discreetShip: formData.get("discreetShip") === "on",
  };
}

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const data = readProductForm(formData);
  if (!data.name || !data.sku || !data.categoryId) {
    throw new Error("Name, SKU, and category are required.");
  }
  const slug = await uniqueSlug(slugify(data.name));

  const product = await prisma.product.create({
    data: { ...data, slug },
    include: { category: true },
  });

  revalidatePath("/admin/products");
  revalidatePath(`/category/${product.category.slug}`);
  redirect(`/admin/products/${product.id}/edit`);
}

export async function updateProduct(productId: string, formData: FormData) {
  await requireAdmin();
  const data = readProductForm(formData);
  if (!data.name || !data.sku || !data.categoryId) {
    throw new Error("Name, SKU, and category are required.");
  }

  const current = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
  const slug =
    slugify(data.name) === current.slug ? current.slug : await uniqueSlug(slugify(data.name), productId);

  await prisma.product.update({
    where: { id: productId },
    data: { ...data, slug },
  });

  revalidatePath("/admin/products");
  revalidatePath(`/product/${slug}`);
  revalidatePath(`/product/${current.slug}`);
}

// Fast path used by the inline price field on the product list.
export async function updateProductPrice(productId: string, formData: FormData) {
  await requireAdmin();
  const priceDollars = parseFloat(String(formData.get("price") ?? "0"));
  const priceCents = Math.round((Number.isFinite(priceDollars) ? priceDollars : 0) * 100);
  const product = await prisma.product.update({
    where: { id: productId },
    data: { priceCents },
  });
  revalidatePath("/admin/products");
  revalidatePath(`/product/${product.slug}`);
}

export async function deleteProduct(productId: string) {
  await requireAdmin();
  const product = await prisma.product.delete({
    where: { id: productId },
    include: { category: true },
  });
  revalidatePath("/admin/products");
  revalidatePath(`/category/${product.category.slug}`);
  redirect("/admin/products");
}

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export async function addProductImage(productId: string, formData: FormData) {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Choose an image file first.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Image is larger than 5MB.");
  }
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    throw new Error("Only JPEG, PNG, WEBP, or AVIF images are allowed.");
  }

  const filename = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const url = await saveUpload(filename, buffer);

  const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
  const count = await prisma.productImage.count({ where: { productId } });
  await prisma.productImage.create({
    data: {
      productId,
      url,
      alt: product.name,
      sortOrder: count,
    },
  });

  revalidatePath(`/admin/products/${productId}/edit`);
  revalidatePath(`/product/${product.slug}`);
}

export async function removeProductImage(imageId: string) {
  await requireAdmin();
  const image = await prisma.productImage.findUniqueOrThrow({
    where: { id: imageId },
    include: { product: true },
  });
  await prisma.productImage.delete({ where: { id: imageId } });
  await deleteUpload(image.url);

  revalidatePath(`/admin/products/${image.productId}/edit`);
  revalidatePath(`/product/${image.product.slug}`);
}

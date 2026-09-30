import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateProduct, addProductImage, removeProductImage } from "@/lib/admin-actions";
import { getCategoryGroups } from "@/lib/category-groups";
import { ProductForm } from "@/components/ProductForm";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categoryGroups] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { images: { orderBy: { sortOrder: "asc" } } } }),
    getCategoryGroups(),
  ]);

  if (!product) notFound();

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl text-white">{product.name}</h1>
      <p className="mt-1 text-sm text-zinc-500">SKU {product.sku}</p>

      <div className="mt-8">
        <ProductForm
          action={updateProduct.bind(null, product.id)}
          categoryGroups={categoryGroups}
          submitLabel="Save changes"
          product={product}
        />
      </div>

      <section className="mt-12 border-t border-white/10 pt-8">
        <h2 className="font-display text-lg text-white">Photos</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Use real, licensed photos from your supplier — not screenshots from other stores.
        </p>

        {product.images.length > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-4 sm:grid-cols-4">
            {product.images.map((img) => (
              <div key={img.id} className="space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.alt}
                  className="aspect-square w-full rounded-lg border border-white/10 object-cover"
                />
                <form action={removeProductImage.bind(null, img.id)}>
                  <ConfirmSubmitButton
                    confirmText="Remove this photo?"
                    className="w-full text-xs text-zinc-500 hover:text-accent"
                  >
                    Remove
                  </ConfirmSubmitButton>
                </form>
              </div>
            ))}
          </div>
        )}

        <form
          action={addProductImage.bind(null, product.id)}
          encType="multipart/form-data"
          className="mt-6 flex items-center gap-3"
        >
          <input
            type="file"
            name="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            required
            className="text-sm text-zinc-300 file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:text-white hover:file:bg-white/20"
          />
          <button
            type="submit"
            className="rounded-full border border-white/15 px-5 py-2 text-sm text-zinc-200 hover:bg-white/5"
          >
            Upload
          </button>
        </form>
      </section>
    </div>
  );
}

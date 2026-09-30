import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { updateProductPrice, deleteProduct } from "@/lib/admin-actions";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }],
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-white">Products</h1>
          <p className="mt-1 text-sm text-zinc-500">{products.length} total</p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent/90"
        >
          + New product
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {products.map((product) => (
              <tr key={product.id} className="bg-surface/40">
                <td className="px-4 py-3 text-white">{product.name}</td>
                <td className="px-4 py-3 text-zinc-400">{product.category.name}</td>
                <td className="px-4 py-3">
                  <form
                    action={updateProductPrice.bind(null, product.id)}
                    className="flex items-center gap-2"
                  >
                    <span className="text-zinc-500">$</span>
                    <input
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={(product.priceCents / 100).toFixed(2)}
                      className="w-24 rounded-md border border-white/10 bg-surface2 px-2 py-1 text-white"
                    />
                    <button
                      type="submit"
                      className="rounded-md border border-white/15 px-2 py-1 text-xs text-zinc-300 hover:bg-white/5"
                    >
                      Save
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3 text-zinc-400">{product.active ? "Yes" : "Hidden"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="text-xs text-zinc-400 hover:text-white"
                    >
                      Edit
                    </Link>
                    <form action={deleteProduct.bind(null, product.id)}>
                      <ConfirmSubmitButton
                        confirmText={`Delete "${product.name}"? This can't be undone.`}
                        className="text-xs text-zinc-500 hover:text-accent"
                      >
                        Delete
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { createProduct } from "@/lib/admin-actions";
import { getCategoryGroups } from "@/lib/category-groups";
import { ProductForm } from "@/components/ProductForm";

export default async function NewProductPage() {
  const categoryGroups = await getCategoryGroups();

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl text-white">New product</h1>
      <p className="mt-1 text-sm text-zinc-500">
        You'll be able to add photos after saving.
      </p>
      <div className="mt-8">
        <ProductForm action={createProduct} categoryGroups={categoryGroups} submitLabel="Create product" />
      </div>
    </div>
  );
}

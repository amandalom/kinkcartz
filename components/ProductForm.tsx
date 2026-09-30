type CategoryGroup = {
  name: string;
  children: { id: string; name: string }[];
};

export function ProductForm({
  action,
  categoryGroups,
  submitLabel,
  product,
}: {
  action: (formData: FormData) => Promise<void>;
  categoryGroups: CategoryGroup[];
  submitLabel: string;
  product?: {
    name: string;
    description: string;
    priceCents: number;
    sku: string;
    categoryId: string;
    material: string | null;
    powerSource: string | null;
    audience: string;
    tags: string | null;
    featured: boolean;
    active: boolean;
    discreetShip: boolean;
  };
}) {
  const field = "w-full rounded-lg border border-white/10 bg-surface2 px-4 py-3 text-sm text-white placeholder:text-zinc-500";
  const label = "text-xs uppercase tracking-wide text-zinc-500";

  return (
    <form action={action} className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="space-y-1.5 md:col-span-2">
        <label className={label}>Name</label>
        <input name="name" required defaultValue={product?.name} className={field} />
      </div>

      <div className="space-y-1.5 md:col-span-2">
        <label className={label}>Description</label>
        <textarea
          name="description"
          required
          rows={3}
          defaultValue={product?.description}
          className={field}
        />
      </div>

      <div className="space-y-1.5">
        <label className={label}>Price (USD)</label>
        <input
          name="price"
          type="number"
          step="0.01"
          min="0"
          required
          defaultValue={product ? (product.priceCents / 100).toFixed(2) : undefined}
          className={field}
        />
      </div>

      <div className="space-y-1.5">
        <label className={label}>SKU</label>
        <input name="sku" required defaultValue={product?.sku} className={field} />
      </div>

      <div className="space-y-1.5 md:col-span-2">
        <label className={label}>Category</label>
        <select name="categoryId" required defaultValue={product?.categoryId} className={field}>
          <option value="" disabled>
            Choose a sub-category
          </option>
          {categoryGroups.map((group) => (
            <optgroup key={group.name} label={group.name}>
              {group.children.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className={label}>Material (optional)</label>
        <input name="material" defaultValue={product?.material ?? ""} className={field} />
      </div>

      <div className="space-y-1.5">
        <label className={label}>Power source (optional)</label>
        <input name="powerSource" defaultValue={product?.powerSource ?? ""} className={field} />
      </div>

      <div className="space-y-1.5">
        <label className={label}>Audience</label>
        <select name="audience" defaultValue={product?.audience ?? "all"} className={field}>
          <option value="all">Entire Codex (all)</option>
          <option value="sub">For Subs</option>
          <option value="dom">For Doms</option>
          <option value="couples">Couples Sanctuary</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label className={label}>Highlight tags (optional)</label>
        <input
          name="tags"
          placeholder="Hand-Finished, Adjustable Fit"
          defaultValue={product?.tags ?? ""}
          className={field}
        />
        <p className="text-[11px] text-zinc-500">
          Comma-separated. Only shown when this product is Featured — badges over the photo on
          the Taxonomy page.
        </p>
      </div>

      <div className="flex flex-wrap gap-6 md:col-span-2">
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            name="active"
            defaultChecked={product ? product.active : true}
          />
          Active (visible in store)
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input type="checkbox" name="featured" defaultChecked={product?.featured} />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            name="discreetShip"
            defaultChecked={product ? product.discreetShip : true}
          />
          Discreet shipping
        </label>
      </div>

      <div className="md:col-span-2">
        <button
          type="submit"
          className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-white hover:bg-accent/90"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

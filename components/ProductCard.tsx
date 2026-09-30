import Link from "next/link";
import { formatCents } from "@/lib/format";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";

export function ProductCard({
  product,
}: {
  product: {
    slug: string;
    name: string;
    priceCents: number;
    compareAtCents?: number | null;
    imageUrl?: string | null;
  };
}) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group rounded-xl border border-white/10 bg-surface p-4 transition hover:border-accent/50"
    >
      {product.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.imageUrl}
          alt={product.name}
          className="aspect-square w-full rounded-lg object-cover"
        />
      ) : (
        <ImagePlaceholder name={product.name} className="aspect-square w-full" />
      )}
      <h3 className="mt-3 text-sm text-white group-hover:text-accent">{product.name}</h3>
      <div className="mt-1 flex items-center gap-2">
        <span className="text-sm text-zinc-300">{formatCents(product.priceCents)}</span>
        {product.compareAtCents && (
          <span className="text-xs text-zinc-500 line-through">
            {formatCents(product.compareAtCents)}
          </span>
        )}
      </div>
    </Link>
  );
}

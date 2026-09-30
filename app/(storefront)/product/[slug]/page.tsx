import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/format";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { Eyebrow } from "@/components/Eyebrow";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: { include: { parent: true } },
      variants: true,
      images: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!product || !product.active) notFound();
  const primaryImage = product.images[0];
  const tags = product.tags ? product.tags.split(",").map((t) => t.trim()) : [];

  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <nav className="text-xs text-zinc-500">
        <Link href="/taxonomy" className="hover:text-gold">Taxonomy</Link>
        {" / "}
        <Link href={`/category/${product.category.slug}`} className="hover:text-gold">
          {product.category.name}
        </Link>
      </nav>

      <div className="mt-5 grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div className="relative">
          {primaryImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={primaryImage.url}
              alt={primaryImage.alt}
              className="aspect-square w-full rounded-2xl object-cover"
            />
          ) : (
            <ImagePlaceholder name={product.name} className="aspect-square rounded-2xl" />
          )}
          {tags.length > 0 && (
            <div className="absolute inset-x-0 bottom-0 flex gap-2 rounded-b-2xl bg-gradient-to-t from-black/70 to-transparent p-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-black/50 px-2.5 py-1 text-[10px] uppercase tracking-wide text-zinc-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.featured && <Eyebrow>Masterwork Highlight</Eyebrow>}
          <h1 className="mt-1 font-display text-2xl text-white">{product.name}</h1>
          <p className="mt-2 font-display text-xl text-gold">{formatCents(product.priceCents)}</p>
          <p className="mt-5 text-sm leading-relaxed text-zinc-400">{product.description}</p>

          <dl className="mt-6 space-y-2 text-sm text-zinc-400">
            {product.material && (
              <div className="flex justify-between border-b border-white/5 py-2">
                <dt>Material</dt>
                <dd className="text-zinc-200">{product.material}</dd>
              </div>
            )}
            {product.powerSource && (
              <div className="flex justify-between border-b border-white/5 py-2">
                <dt>Power</dt>
                <dd className="text-zinc-200">{product.powerSource}</dd>
              </div>
            )}
            <div className="flex justify-between border-b border-white/5 py-2">
              <dt>SKU</dt>
              <dd className="text-zinc-200">{product.sku}</dd>
            </div>
          </dl>

          <div className="mt-8">
            <AddToCartButton
              productId={product.id}
              name={product.name}
              priceCents={product.priceCents}
              image={primaryImage?.url}
            />
          </div>

          <p className="mt-4 text-xs text-zinc-500">
            {product.discreetShip
              ? "Ships in plain packaging with a discreet billing descriptor."
              : "Standard shipping."}
          </p>
        </div>
      </div>
    </main>
  );
}

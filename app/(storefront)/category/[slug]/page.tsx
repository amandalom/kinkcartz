import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { Eyebrow } from "@/components/Eyebrow";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      parent: true,
      children: { orderBy: { sortOrder: "asc" } },
      products: {
        where: { active: true },
        orderBy: { createdAt: "desc" },
        include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      },
    },
  });

  if (!category) notFound();

  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <nav className="text-xs text-zinc-500">
        <Link href="/taxonomy" className="hover:text-gold">Taxonomy</Link>
        {category.parent && (
          <>
            {" / "}
            <Link href={`/category/${category.parent.slug}`} className="hover:text-gold">
              {category.parent.name}
            </Link>
          </>
        )}
        {" / "}
        <span className="text-zinc-300">{category.name}</span>
      </nav>

      <Eyebrow className="mt-4">{category.parent ? "Chamber" : "Pillar"}</Eyebrow>
      <h1 className="mt-1 font-display text-3xl text-white">{category.name}</h1>
      {category.description && (
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">{category.description}</p>
      )}

      {category.children.length > 0 && (
        <section className="mt-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
            Chambers & Articulations
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {category.children.map((child) => (
              <Link
                key={child.id}
                href={`/category/${child.slug}`}
                className="rounded-xl border border-white/10 bg-surface px-4 py-5 text-center text-sm text-zinc-200 transition hover:border-gold/40 hover:text-white"
              >
                {child.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          {category.products.length > 0 ? "Artworks" : "No artworks yet"}
        </p>
        {category.products.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">
            This sub-category doesn&apos;t have any listed products yet.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-3">
            {category.products.map((product) => (
              <ProductCard
                key={product.id}
                product={{ ...product, imageUrl: product.images[0]?.url }}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

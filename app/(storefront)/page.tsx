import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Eyebrow } from "@/components/Eyebrow";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [topCategories, featured] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: { sortOrder: "asc" },
      include: { children: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.product.findMany({
      where: { active: true, featured: true },
      take: 3,
      orderBy: { priceCents: "desc" },
      include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
    }),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <section className="text-center">
        <Eyebrow>Private Inventory</Eyebrow>
        <h1 className="mt-2 font-display text-4xl text-white">Shop with intention.</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-zinc-400">
          Curated gear across bondage, impact, pleasure, and fetish wear — body-safe materials,
          discreet shipping, no judgment.
        </p>
        <Link
          href="/taxonomy"
          className="mt-6 inline-block rounded-full bg-gold px-6 py-3 text-sm font-medium text-ink hover:bg-gold/90"
        >
          Enter the Taxonomy
        </Link>
      </section>

      {featured.length > 0 && (
        <section className="mt-14">
          <div className="flex items-center justify-between">
            <Eyebrow>Masterwork Highlights</Eyebrow>
            <Link href="/vault" className="text-xs text-zinc-500 hover:text-gold">
              View the Vault
            </Link>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-4">
            {featured.map((product) => (
              <ProductCard
                key={product.id}
                product={{ ...product, imageUrl: product.images[0]?.url }}
              />
            ))}
          </div>
        </section>
      )}

      <section className="mt-14">
        <Eyebrow>Browse by Pillar</Eyebrow>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {topCategories.map((cat, i) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="group rounded-2xl border border-white/10 bg-surface p-5 transition hover:border-gold/40"
            >
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">
                Pillar {i + 1}
              </span>
              <h2 className="mt-1 font-display text-lg text-white group-hover:text-gold">
                {cat.name}
              </h2>
              {cat.description && (
                <p className="mt-2 text-sm text-zinc-400">{cat.description}</p>
              )}
              <p className="mt-3 text-xs uppercase tracking-wide text-zinc-500">
                {cat.children.length} sub-categories
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

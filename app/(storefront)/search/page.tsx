import { prisma } from "@/lib/prisma";
import { Eyebrow } from "@/components/Eyebrow";
import { ProductCard } from "@/components/ProductCard";
import { SearchIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim().toLowerCase();

  const results = query
    ? (
        await prisma.product.findMany({
          where: { active: true },
          include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
        })
      ).filter(
        (p) => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)
      )
    : [];

  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <Eyebrow>Codex Search</Eyebrow>
      <h1 className="mt-1 font-display text-3xl text-white">Find a Piece</h1>

      <form action="/search" method="get" className="mt-5">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            name="q"
            defaultValue={q}
            autoFocus
            placeholder="Search archetypes, metals, sensorial arts…"
            className="w-full rounded-xl border border-white/10 bg-surface py-3 pl-11 pr-4 text-sm text-white placeholder:text-zinc-500"
          />
        </div>
      </form>

      {query && (
        <p className="mt-6 text-xs uppercase tracking-wide text-zinc-500">
          {results.length} result{results.length === 1 ? "" : "s"} for &ldquo;{q}&rdquo;
        </p>
      )}

      {query && results.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-3">
          {results.map((product) => (
            <ProductCard
              key={product.id}
              product={{ ...product, imageUrl: product.images[0]?.url }}
            />
          ))}
        </div>
      )}

      {query && results.length === 0 && (
        <p className="mt-10 text-center text-sm text-zinc-500">
          Nothing matches that search within this collection.
        </p>
      )}
    </main>
  );
}

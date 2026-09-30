import { prisma } from "@/lib/prisma";
import { Eyebrow } from "@/components/Eyebrow";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function VaultPage() {
  const products = await prisma.product.findMany({
    where: { active: true, featured: true },
    orderBy: { priceCents: "desc" },
    include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
  });

  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <Eyebrow>Members' Reserve</Eyebrow>
      <h1 className="mt-1 font-display text-3xl text-white">The Vault</h1>
      <p className="mt-2 max-w-xl text-sm text-zinc-400">
        Masterwork pieces, hand-picked from across the collection.
      </p>

      {products.length === 0 ? (
        <p className="mt-10 text-sm text-zinc-500">Nothing in the Vault yet.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={{ ...product, imageUrl: product.images[0]?.url }}
            />
          ))}
        </div>
      )}
    </main>
  );
}

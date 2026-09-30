import { prisma } from "@/lib/prisma";

export type MasterworkProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  tags: string[];
  imageUrl: string | null;
};

export type Chamber = { id: string; name: string; slug: string; count: number };

export type Pillar = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  pillarNumber: number;
  suiteCount: number;
  artworkCount: number;
  chambers: Chamber[];
  masterwork: MasterworkProduct | null;
};

const VALID_AUDIENCES = new Set(["sub", "dom", "couples"]);

export async function getTaxonomyData(opts: { audience?: string; query?: string }) {
  const audience = opts.audience && VALID_AUDIENCES.has(opts.audience) ? opts.audience : undefined;
  const q = opts.query?.trim().toLowerCase();

  const topCategories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { sortOrder: "asc" },
    include: { children: { orderBy: { sortOrder: "asc" } } },
  });

  const products = await prisma.product.findMany({
    where: { active: true, ...(audience ? { audience } : {}) },
    include: { images: { take: 1, orderBy: { sortOrder: "asc" } } },
    orderBy: { priceCents: "desc" },
  });

  const filtered = q
    ? products.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      )
    : products;

  const totalSubTiers = topCategories.reduce((sum, t) => sum + t.children.length, 0);

  const pillars: Pillar[] = topCategories.map((top, i) => {
    const childIds = new Set(top.children.map((c) => c.id));
    const pillarProducts = filtered.filter((p) => childIds.has(p.categoryId));

    const chambers: Chamber[] = top.children.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      count: pillarProducts.filter((p) => p.categoryId === c.id).length,
    }));

    const masterworkSource =
      pillarProducts.find((p) => p.featured && p.tags) ??
      pillarProducts.find((p) => p.featured) ??
      pillarProducts[0] ??
      null;

    return {
      id: top.id,
      name: top.name,
      slug: top.slug,
      description: top.description,
      pillarNumber: i + 1,
      suiteCount: top.children.length,
      artworkCount: pillarProducts.length,
      chambers,
      masterwork: masterworkSource
        ? {
            id: masterworkSource.id,
            slug: masterworkSource.slug,
            name: masterworkSource.name,
            description: masterworkSource.description,
            priceCents: masterworkSource.priceCents,
            tags: masterworkSource.tags ? masterworkSource.tags.split(",").map((t) => t.trim()) : [],
            imageUrl: masterworkSource.images[0]?.url ?? null,
          }
        : null,
    };
  });

  return { pillars, totalSubTiers };
}

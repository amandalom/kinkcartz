import { prisma } from "@/lib/prisma";

export async function getCategoryGroups() {
  const topCategories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { sortOrder: "asc" },
    include: { children: { orderBy: { sortOrder: "asc" } } },
  });

  return topCategories.map((top) => ({
    name: top.name,
    children: top.children.map((c) => ({ id: c.id, name: c.name })),
  }));
}

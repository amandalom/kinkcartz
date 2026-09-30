import { getTaxonomyData } from "@/lib/taxonomy-data";
import { Eyebrow } from "@/components/Eyebrow";
import { FilterPill } from "@/components/FilterPill";
import { TaxonomyAccordion } from "@/components/TaxonomyAccordion";
import { SearchIcon, SlidersIcon, LockIcon, KeyIcon, LinkIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

function buildHref(audience: string, q?: string) {
  const params = new URLSearchParams();
  if (audience !== "all") params.set("audience", audience);
  if (q) params.set("q", q);
  const qs = params.toString();
  return qs ? `/taxonomy?${qs}` : "/taxonomy";
}

export default async function TaxonomyPage({
  searchParams,
}: {
  searchParams: Promise<{ audience?: string; q?: string }>;
}) {
  const params = await searchParams;
  const audience = params.audience ?? "all";
  const { pillars, totalSubTiers } = await getTaxonomyData({ audience, query: params.q });

  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <Eyebrow>Private Inventory</Eyebrow>
      <h1 className="mt-1 font-display text-3xl text-white">Curated Taxonomy</h1>

      <form action="/taxonomy" method="get" className="mt-5">
        {audience !== "all" && <input type="hidden" name="audience" value={audience} />}
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            name="q"
            defaultValue={params.q}
            placeholder="Search archetypes, metals, sensorial arts…"
            className="w-full rounded-xl border border-white/10 bg-surface py-3 pl-11 pr-4 text-sm text-white placeholder:text-zinc-500"
          />
        </div>
      </form>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        <FilterPill href={buildHref("all", params.q)} active={audience === "all"}>
          Entire Codex
        </FilterPill>
        <FilterPill
          href={buildHref("sub", params.q)}
          active={audience === "sub"}
          icon={<LockIcon className="h-3.5 w-3.5" />}
        >
          For Subs
        </FilterPill>
        <FilterPill
          href={buildHref("dom", params.q)}
          active={audience === "dom"}
          icon={<KeyIcon className="h-3.5 w-3.5" />}
        >
          For Doms
        </FilterPill>
        <FilterPill
          href={buildHref("couples", params.q)}
          active={audience === "couples"}
          icon={<LinkIcon className="h-3.5 w-3.5" />}
        >
          Couples Sanctuary
        </FilterPill>
      </div>

      <div className="mt-6 flex items-center justify-between text-[11px] uppercase tracking-wide text-zinc-500">
        <span className="flex items-center gap-1.5">
          <SlidersIcon className="h-4 w-4" />
          Material & Sensation Filters
        </span>
        <span>{totalSubTiers} Atelier Sub-Tiers</span>
      </div>

      {pillars.every((p) => p.artworkCount === 0) ? (
        <p className="mt-10 text-center text-sm text-zinc-500">
          Nothing matches that search within this collection.
        </p>
      ) : (
        <TaxonomyAccordion pillars={pillars} />
      )}
    </main>
  );
}

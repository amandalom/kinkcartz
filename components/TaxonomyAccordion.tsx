"use client";

import Link from "next/link";
import { useState } from "react";
import { formatCents } from "@/lib/format";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { ChevronDownIcon, LockIcon } from "@/components/icons";
import type { Pillar } from "@/lib/taxonomy-data";

export function TaxonomyAccordion({ pillars }: { pillars: Pillar[] }) {
  const [openId, setOpenId] = useState<string | null>(pillars[0]?.id ?? null);

  return (
    <div className="mt-6 space-y-4">
      {pillars.map((pillar) => {
        const isOpen = openId === pillar.id;
        return (
          <div
            key={pillar.id}
            className="overflow-hidden rounded-2xl border border-white/10 bg-surface"
          >
            <button
              onClick={() => setOpenId(isOpen ? null : pillar.id)}
              className="flex w-full items-center gap-3 px-5 py-4 text-left"
            >
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
                <LockIcon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">
                  Pillar {pillar.pillarNumber} • {pillar.suiteCount} Suites
                </span>
                <span className="block truncate font-display text-lg text-white">{pillar.name}</span>
              </span>
              <span className="flex flex-shrink-0 items-center gap-2 text-xs text-zinc-500">
                {pillar.artworkCount} Artworks
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </span>
            </button>

            {isOpen && (
              <div className="border-t border-white/5 px-5 pb-5 pt-4">
                {pillar.masterwork && (
                  <Link href={`/product/${pillar.masterwork.slug}`} className="group block">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">
                        Masterwork Highlight
                      </span>
                      <span className="font-display text-sm text-gold">
                        {formatCents(pillar.masterwork.priceCents)}
                      </span>
                    </div>
                    <p className="mt-1 font-display text-base text-white group-hover:text-gold">
                      {pillar.masterwork.name}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                      {pillar.masterwork.description}
                    </p>

                    <div className="relative mt-3 aspect-[16/9] w-full overflow-hidden rounded-xl">
                      {pillar.masterwork.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={pillar.masterwork.imageUrl}
                          alt={pillar.masterwork.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImagePlaceholder name={pillar.masterwork.name} className="h-full w-full" />
                      )}
                      {pillar.masterwork.tags.length > 0 && (
                        <div className="absolute inset-x-0 bottom-0 flex gap-2 bg-gradient-to-t from-black/70 to-transparent p-3">
                          {pillar.masterwork.tags.map((tag) => (
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
                  </Link>
                )}

                <p className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  Chambers & Articulations
                </p>
                <ul className="divide-y divide-white/5">
                  {pillar.chambers.map((chamber) => (
                    <li key={chamber.id}>
                      <Link
                        href={`/category/${chamber.slug}`}
                        className="flex items-center justify-between py-2.5 text-sm text-zinc-300 hover:text-white"
                      >
                        <span className="flex items-center gap-2">
                          <span className="h-1 w-1 rounded-full bg-gold" />
                          {chamber.name}
                        </span>
                        <span className="text-xs text-zinc-500">{chamber.count} items</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

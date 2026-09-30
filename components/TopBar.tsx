"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-store";
import { useDiscreet } from "@/lib/discreet-store";
import { EyeOffIcon, SearchIcon, BagIcon, UserIcon } from "@/components/icons";

export function TopBar() {
  const totalItems = useCart((s) => s.totalItems());
  const openCart = useCart((s) => s.open);
  const toggleDiscreet = useDiscreet((s) => s.toggle);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3.5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/40 text-xs font-semibold text-gold">
            k
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg text-gold">kinkcartz</span>
            <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Private Collection
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-4 text-zinc-400">
          <button
            onClick={toggleDiscreet}
            aria-label="Discreet mode"
            className="transition hover:text-white"
          >
            <EyeOffIcon className="h-5 w-5" />
          </button>
          <Link href="/search" aria-label="Search" className="transition hover:text-white">
            <SearchIcon className="h-5 w-5" />
          </Link>
          <button
            onClick={openCart}
            aria-label="Bag"
            className="relative transition hover:text-white"
          >
            <BagIcon className="h-5 w-5" />
            {mounted && totalItems > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] text-white">
                {totalItems}
              </span>
            )}
          </button>
          <Link
            href="/account"
            aria-label="Account"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-gold text-ink transition hover:bg-gold/90"
          >
            <UserIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-store";
import { StarIcon, GridIcon, KeyIcon, BagIcon } from "@/components/icons";

const TABS = [
  { href: "/", label: "Explore", icon: StarIcon },
  { href: "/taxonomy", label: "Taxonomy", icon: GridIcon },
  { href: "/vault", label: "The Vault", icon: KeyIcon },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const openCart = useCart((s) => s.open);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-2 py-2">
        {TABS.map((tab) => {
          const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] font-medium uppercase tracking-wide transition ${
                active ? "text-gold" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Icon className="h-5 w-5" />
              {tab.label}
            </Link>
          );
        })}

        <button
          onClick={openCart}
          className="flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500 transition hover:text-zinc-300"
        >
          <BagIcon className="h-5 w-5" />
          Bag
        </button>

        <Link
          href="/account"
          className={`flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] font-medium uppercase tracking-wide transition ${
            pathname.startsWith("/account") ? "text-gold" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <KeyIcon className="h-5 w-5" />
          Sanctum
        </Link>
      </div>
    </nav>
  );
}

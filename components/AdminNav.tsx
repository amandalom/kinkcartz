"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="border-b border-white/10 bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <span className="font-display text-sm text-white">kinkcartz admin</span>
          <Link
            href="/admin/products"
            className={`text-sm ${pathname.startsWith("/admin/products") ? "text-white" : "text-zinc-400 hover:text-white"}`}
          >
            Products
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300">
            View store
          </Link>
          <button onClick={signOut} className="text-xs text-zinc-500 hover:text-accent">
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

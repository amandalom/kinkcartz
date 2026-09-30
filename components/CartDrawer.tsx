"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-store";
import { formatCents } from "@/lib/format";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";

export function CartDrawer() {
  const { items, isOpen, close, remove, setQuantity } = useCart();
  const total = useCart((s) => s.totalCents());

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={close} />
      <div className="relative flex h-full w-full max-w-md flex-col bg-surface p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg text-white">Your Bag</h2>
          <button onClick={close} className="text-zinc-400 hover:text-white">
            Close
          </button>
        </div>

        <div className="mt-6 flex-1 overflow-y-auto">
          {items.length === 0 && <p className="text-sm text-zinc-500">Your bag is empty.</p>}
          <ul className="space-y-4">
            {items.map((item) => (
              <li key={`${item.productId}-${item.variantId ?? ""}`} className="flex gap-3">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-16 w-16 flex-shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <ImagePlaceholder name={item.name} className="h-16 w-16 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-sm text-white">{item.name}</p>
                  {item.variantLabel && (
                    <p className="text-xs text-zinc-500">{item.variantLabel}</p>
                  )}
                  <div className="mt-1 flex items-center gap-2 text-xs text-zinc-400">
                    <button
                      onClick={() =>
                        setQuantity(item.productId, item.quantity - 1, item.variantId)
                      }
                      className="h-6 w-6 rounded border border-white/15 hover:bg-white/5"
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() =>
                        setQuantity(item.productId, item.quantity + 1, item.variantId)
                      }
                      className="h-6 w-6 rounded border border-white/15 hover:bg-white/5"
                    >
                      +
                    </button>
                    <button
                      onClick={() => remove(item.productId, item.variantId)}
                      className="ml-auto text-zinc-500 hover:text-accent"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <p className="text-sm text-zinc-300">
                  {formatCents(item.priceCents * item.quantity)}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 border-t border-white/10 pt-4">
          <div className="flex justify-between text-sm text-zinc-300">
            <span>Subtotal</span>
            <span className="font-display text-gold">{formatCents(total)}</span>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Shipping in plain, unmarked packaging. No product branding on the outside.
          </p>
          <Link
            href="/checkout"
            onClick={close}
            className="mt-4 block rounded-full bg-accent px-6 py-3 text-center text-sm font-medium text-white hover:bg-accent/90"
          >
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}

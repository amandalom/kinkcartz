"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-store";

export function AddToCartButton({
  productId,
  name,
  priceCents,
  image,
}: {
  productId: string;
  name: string;
  priceCents: number;
  image?: string;
}) {
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);

  return (
    <button
      onClick={() => {
        add({ productId, name, priceCents, image, quantity: 1 });
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }}
      className="w-full rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition hover:bg-accent/90"
    >
      {added ? "Added ✓" : "Add to Bag"}
    </button>
  );
}

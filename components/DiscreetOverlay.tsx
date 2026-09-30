"use client";

import { useDiscreet } from "@/lib/discreet-store";

export function DiscreetOverlay() {
  const active = useDiscreet((s) => s.active);
  const deactivate = useDiscreet((s) => s.deactivate);

  if (!active) return null;

  return (
    <button
      onClick={deactivate}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-3 bg-ink text-zinc-500"
    >
      <span className="font-display text-lg text-zinc-300">kinkcartz</span>
      <span className="text-xs">Tap anywhere to return</span>
    </button>
  );
}

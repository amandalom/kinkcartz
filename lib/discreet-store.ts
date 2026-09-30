"use client";

import { create } from "zustand";

// Deliberately NOT persisted — a quick cover-the-screen toggle should
// reset when the tab reloads, not linger as saved state.
type DiscreetState = {
  active: boolean;
  toggle: () => void;
  deactivate: () => void;
};

export const useDiscreet = create<DiscreetState>((set) => ({
  active: false,
  toggle: () => set((s) => ({ active: !s.active })),
  deactivate: () => set({ active: false }),
}));

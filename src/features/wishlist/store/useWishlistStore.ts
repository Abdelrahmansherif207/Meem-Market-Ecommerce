"use client";
import { create } from "zustand";
import type { PendingWishlistAction } from "../types";

/**
 * Global wishlist state shared across the app (product cards, detail page,
 * wishlist page and the header badge). Keyed by product id because the card
 * toggle endpoint and the `in_wishlist` payload field are product-level.
 *
 * This store is intentionally NOT persisted — wishlists live on the server.
 * `pendingAction` holds the action a guest wanted to run before being asked to
 * sign in, so it can be resumed after a successful login.
 */
type WishlistState = {
  entries: Record<number, boolean>;
  count: number;
  pendingAction: PendingWishlistAction | null;
  setEntry: (productId: number, value: boolean) => void;
  /** Only writes if the product has no tracked state yet (payload seeding). */
  seed: (productId: number, value: boolean) => void;
  setCount: (count: number) => void;
  adjustCount: (delta: number) => void;
  setPendingAction: (action: PendingWishlistAction | null) => void;
  clearPendingAction: () => void;
  reset: () => void;
};

const initialState = {
  entries: {},
  count: 0,
  pendingAction: null,
};

export const useWishlistStore = create<WishlistState>()((set, get) => ({
  ...initialState,

  setEntry: (productId, value) =>
    set((state) => ({
      entries: { ...state.entries, [productId]: value },
    })),

  seed: (productId, value) =>
    set((state) => {
      if (state.entries[productId] !== undefined) return state;
      return { entries: { ...state.entries, [productId]: value } };
    }),

  setCount: (count) => set({ count }),

  adjustCount: (delta) => set({ count: Math.max(0, get().count + delta) }),

  setPendingAction: (action) => set({ pendingAction: action }),

  clearPendingAction: () => set({ pendingAction: null }),

  reset: () => set({ ...initialState }),
}));

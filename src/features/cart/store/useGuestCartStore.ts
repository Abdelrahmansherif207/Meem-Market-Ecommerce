"use client";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { CART_STORAGE_KEY } from "@/shared/constants/storageKeys";
import type { GuestCartItem, AddBulkPayload, CartLineIdentity } from "../types";
import { matchesCartLine } from "../types";

type GuestCartState = {
  items: GuestCartItem[];
  isSyncing: boolean;
  syncError: string | null;
  addItem: (item: GuestCartItem) => void;
  removeItem: (productId: number, line?: CartLineIdentity) => void;
  updateQuantity: (productId: number, quantity: number, line?: CartLineIdentity) => void;
  clearCart: () => void;
  setSyncing: (syncing: boolean) => void;
  setSyncError: (error: string | null) => void;
  getSyncPayload: () => AddBulkPayload;
  getTotalItems: () => number;
};

export const useGuestCartStore = create<GuestCartState>()(
  persist(
    (set, get) => ({
      items: [],
      isSyncing: false,
      syncError: null,

      addItem: (item) => {
        const variantId = item.product_variant_id ?? null;
        set((state) => {
          const existing = state.items.find(
            (i) =>
              i.product_id === item.product_id &&
              (i.product_variant_id ?? null) === variantId,
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i === existing
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, product_variant_id: variantId }] };
        });
      },

      removeItem: (productId, line) => {
        set((state) => ({
          items: state.items.filter((i) => !matchesCartLine(i, productId, line)),
        }));
      },

      updateQuantity: (productId, quantity, line) => {
        if (quantity <= 0) {
          get().removeItem(productId, line);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            matchesCartLine(i, productId, line) ? { ...i, quantity } : i,
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      setSyncing: (syncing) =>
        set(syncing ? { isSyncing: true, syncError: null } : { isSyncing: false }),

      setSyncError: (error) => set({ syncError: error, isSyncing: false }),

      getSyncPayload: () => ({
        items: get().items.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
          product_variant_id: i.product_variant_id ?? null,
          shipping_method: "scheduled" as const,
        })),
      }),

      getTotalItems: () => {
        return get().items.reduce((sum, i) => sum + i.quantity, 0);
      },
    }),
    {
      name: CART_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
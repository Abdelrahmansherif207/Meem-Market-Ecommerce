"use client";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { CART_STORAGE_KEY } from "@/shared/constants/storageKeys";
import type { GuestCartItem, AddBulkPayload } from "../types";

type GuestCartState = {
  items: GuestCartItem[];
  isSyncing: boolean;
  syncError: string | null;
  addItem: (item: GuestCartItem) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
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
        set((state) => {
          const existing = state.items.find(
            (i) => i.product_id === item.product_id,
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product_id === item.product_id
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i,
              ),
            };
          }
          return { items: [...state.items, item] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.product_id !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product_id === productId ? { ...i, quantity } : i,
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
          shipping_method: i.deliveryType,
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
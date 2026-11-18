"use client";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { CART_STORAGE_KEY } from "@/shared/constants/storageKeys";
import type { GuestCartItem, CartLineIdentity } from "../types";
import { matchesCartLine } from "../types";

type GuestCartState = {
  items: GuestCartItem[];
  addItem: (item: GuestCartItem) => void;
  removeItem: (productId: number, line?: CartLineIdentity) => void;
  updateQuantity: (productId: number, quantity: number, line?: CartLineIdentity) => void;
  getTotalItems: () => number;
};

export const useGuestCartStore = create<GuestCartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const variantId = item.product_variant_id ?? null;
        const deliveryType = item.deliveryType ?? "scheduled";
        set((state) => {
          const existing = state.items.find(
            (i) =>
              i.product_id === item.product_id &&
              (i.product_variant_id ?? null) === variantId &&
              (i.deliveryType ?? "scheduled") === deliveryType,
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
"use client";
import { create } from "zustand";
import { cartService } from "../services/cartService";

type ServerCartState = {
  totalQuantity: number;
  setTotalQuantity: (quantity: number) => void;
  adjustQuantity: (delta: number) => void;
  fetchCartCount: (lang?: string) => Promise<void>;
};

export const useServerCartStore = create<ServerCartState>((set, get) => ({
  totalQuantity: 0,
  setTotalQuantity: (quantity) => set({ totalQuantity: quantity }),
  adjustQuantity: (delta) =>
    set({ totalQuantity: Math.max(0, get().totalQuantity + delta) }),
  fetchCartCount: async (lang?: string) => {
    try {
      const cart = await cartService.getCart(lang);
      set({ totalQuantity: cart?.total_quantity ?? 0 });
    } catch {
      // Silently ignore — the badge is best-effort
    }
  },
}));

"use client";
import { create } from "zustand";

type PickupLocationState = {
  selectedLocationId: number | null;
  setSelectedLocationId: (id: number | null) => void;
  clear: () => void;
};

export const usePickupLocationStore = create<PickupLocationState>((set) => ({
  selectedLocationId: null,
  setSelectedLocationId: (id) => set({ selectedLocationId: id }),
  clear: () => set({ selectedLocationId: null }),
}));

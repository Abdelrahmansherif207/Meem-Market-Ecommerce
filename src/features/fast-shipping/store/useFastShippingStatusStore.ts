"use client";

import { create } from "zustand";
import { fastShippingService } from "../services/fastShippingService";
import type { FastShippingStatus } from "../services/fastShippingService";

const CACHE_TTL = 60_000;

type FastShippingStatusState = {
  status: FastShippingStatus | null;
  lastFetched: number;
  loading: boolean;
  error: string | null;
  fetchStatus: (lang?: string) => Promise<void>;
};

export const useFastShippingStatusStore = create<FastShippingStatusState>(
  (set, get) => ({
    status: null,
    lastFetched: 0,
    loading: false,
    error: null,

    fetchStatus: async (lang?: string) => {
      const { lastFetched } = get();
      if (Date.now() - lastFetched < CACHE_TTL) return;

      set({ loading: true, error: null });
      try {
        const status = await fastShippingService.getStatus(lang);
        set({ status, lastFetched: Date.now(), loading: false });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to fetch fast shipping status";
        set({ error: msg, loading: false });
      }
    },
  }),
);

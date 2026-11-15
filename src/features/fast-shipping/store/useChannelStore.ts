"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { CHANNEL_STORAGE_KEY } from "@/shared/constants/storageKeys";

export type Channel = "home" | "fast-shipping";

type ChannelState = {
  channel: Channel;
  setChannel: (channel: Channel) => void;
  toggleChannel: () => void;
};

/**
 * Browsing channel. Product cards default their add-to-cart delivery type to
 * this selection, but every mutation still sends the channel explicitly; the
 * store is never used as a global request header.
 */
export const useChannelStore = create<ChannelState>()(
  persist(
    (set) => ({
      channel: "home",
      setChannel: (channel) => set({ channel }),
      toggleChannel: () =>
        set((state) => ({
          channel: state.channel === "home" ? "fast-shipping" : "home",
        })),
    }),
    {
      name: CHANNEL_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ channel: state.channel }),
    },
  ),
);

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

function writeChannelToStorage(channel: Channel | null) {
  if (typeof window === "undefined") return;
  if (!channel) {
    window.localStorage.removeItem(CHANNEL_STORAGE_KEY);
    document.cookie = CHANNEL_STORAGE_KEY + "=; path=/; max-age=0";
    return;
  }
  window.localStorage.setItem(CHANNEL_STORAGE_KEY, channel);
  document.cookie = CHANNEL_STORAGE_KEY + "=" + channel + "; path=/; max-age=31536000";
}

export const useChannelStore = create<ChannelState>()(
  persist(
    (set) => ({
      channel: "home",
      setChannel: (channel) => {
        writeChannelToStorage(channel);
        set({ channel });
      },
      toggleChannel: () =>
        set((state) => {
          const next = state.channel === "home" ? "fast-shipping" : "home";
          writeChannelToStorage(next);
          return { channel: next };
        }),
    }),
    {
      name: CHANNEL_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ channel: state.channel }),
      onRehydrateStorage: () => (state) => {
        if (state?.channel) {
          writeChannelToStorage(state.channel);
        }
      },
    },
  ),
);

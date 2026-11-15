"use client";

import { useEffect } from "react";
import { useChannelStore } from "../store/useChannelStore";

/** Mirrors the browsing channel onto <html data-channel> for theme tokens. */
export function ChannelThemeProvider() {
  const channel = useChannelStore((s) => s.channel);

  useEffect(() => {
    document.documentElement.dataset.channel = channel;
  }, [channel]);

  return null;
}

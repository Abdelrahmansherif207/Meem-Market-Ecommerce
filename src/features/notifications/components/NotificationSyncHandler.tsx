"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useNotificationsHydration } from "../hooks/useNotificationsHydration";

export function NotificationSyncHandler() {
  const locale = useLocale();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hydrate = useNotificationsHydration(locale);
  const syncedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      syncedRef.current = false;
      return;
    }
    if (syncedRef.current) return;
    syncedRef.current = true;

    hydrate();
  }, [isAuthenticated, locale, hydrate]);

  return null;
}
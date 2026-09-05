"use client";

import { useCallback } from "react";
import { notificationService, normalizeList } from "../services/notificationService";
import { useNotificationStore } from "../store/useNotificationStore";
import type { RawNotificationListResponse } from "../types";

export function useNotificationsHydration(locale: string) {
  return useCallback(async () => {
    const store = useNotificationStore.getState();
    store.setInitialLoading(true);
    try {
      const [unread, list] = await Promise.all([
        notificationService.unread(locale),
        notificationService.list(1, locale).catch(() => null),
      ]);
      const items = list
        ? normalizeList(list as RawNotificationListResponse, locale)
        : [];
      store.setNotifications(items);
      store.setPagination(
        list?.links?.current_page ?? 1,
        list?.links?.last_page ?? 1,
        list?.links?.total ?? items.length,
      );
      store.setUnreadCount(unread);
    } finally {
      store.setInitialLoading(false);
    }
  }, [locale]);
}
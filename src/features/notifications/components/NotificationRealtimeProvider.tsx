"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import {
  subscribeToUserNotifications,
  unsubscribeUserNotifications,
  disconnectEcho,
} from "@/shared/lib/echo";
import { useNotificationStore } from "../store/useNotificationStore";
import { pushToast } from "../store/useToastStore";
import { normalizeNotification } from "../utils";
import type { RawNotification } from "../types";

export function NotificationRealtimeProvider() {
  const locale = useLocale();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userId = useAuthStore((s) => s.id ?? s.userId);
  const subscribedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !userId) return;
    const key = `${userId}:${locale}`;
    if (subscribedRef.current === key) return;
    subscribedRef.current = key;

    subscribeToUserNotifications(userId, {
      onNotification: (raw) => {
        const notification = normalizeNotification(raw as RawNotification, locale);
        if (!notification.id) return;
        useNotificationStore.getState().prependNotification(notification);
        useNotificationStore.getState().incrementUnread();
        pushToast(notification);
      },
      onError: () => {
        subscribedRef.current = null;
      },
    });

    return () => {
      if (subscribedRef.current === key) {
        unsubscribeUserNotifications(userId);
        subscribedRef.current = null;
      }
    };
  }, [isAuthenticated, userId, locale]);

  useEffect(() => {
    return () => disconnectEcho();
  }, []);

  return null;
}
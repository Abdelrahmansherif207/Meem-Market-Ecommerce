"use client";

import { useCallback, useState } from "react";
import { Bell, CheckCheck, Loader2, RotateCw } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useAuthModalStore } from "@/features/auth/store/useAuthModalStore";
import { useNotificationStore } from "../store/useNotificationStore";
import { notificationService, normalizeList } from "../services/notificationService";
import { useNotificationsHydration } from "../hooks/useNotificationsHydration";
import { getNotificationConfig } from "../constants";
import { NotificationItemRow } from "./NotificationItemRow";
import { cn } from "@/shared/utils/cn";
import type { NotificationItem, RawNotificationListResponse } from "../types";

export function NotificationsPage() {
  const t = useTranslations("notifications");
  const locale = useLocale();
  const router = useRouter();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const openAuthModal = useAuthModalStore((s) => s.open);

  const notifications = useNotificationStore((s) => s.notifications);
  const page = useNotificationStore((s) => s.page);
  const lastPage = useNotificationStore((s) => s.lastPage);
  const total = useNotificationStore((s) => s.total);
  const initialLoading = useNotificationStore((s) => s.initialLoading);
  const loading = useNotificationStore((s) => s.loading);
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  const hydrate = useNotificationsHydration(locale);
  const [retrying, setRetrying] = useState(false);

  const loadNextPage = useCallback(async () => {
    if (loading || page >= lastPage) return;
    const store = useNotificationStore.getState();
    store.setLoading(true);
    try {
      const list = (await notificationService.list(page + 1, locale)) as RawNotificationListResponse;
      const next = normalizeList(list, locale);
      store.appendNotifications(next);
      store.setPagination(list.links.current_page, list.links.last_page, list.links.total);
    } catch {
      /* ignore */
    } finally {
      store.setLoading(false);
    }
  }, [loading, page, lastPage, locale]);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await hydrate();
    } finally {
      setRetrying(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead(locale);
      useNotificationStore.getState().markAllAsRead();
    } catch {
      /* ignore */
    }
  };

  const handleRead = (n: NotificationItem) => {
    useNotificationStore.getState().markAsRead(n.id);
    notificationService.markAsRead(n.id, locale).catch(() => {});
  };

  const handleDelete = async (n: NotificationItem) => {
    useNotificationStore.getState().removeNotification(n.id);
    try {
      await notificationService.delete(n.id, locale);
    } catch {
      /* keep local removal */
    }
  };

  const handleClick = (n: NotificationItem) => {
    const config = getNotificationConfig(n.type);
    router.push(config.getActionUrl(n));
    if (!n.readAt) handleRead(n);
  };

  if (!isAuthenticated) {
    return (
      <main className="container mx-auto flex flex-1 flex-col px-4 py-10">
        <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 rounded-3xl border border-border bg-white p-10 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface">
            <Bell className="h-8 w-8 text-text-secondary/50" />
          </div>
          <h1 className="text-xl font-bold text-text-primary">{t("title")}</h1>
          <p className="text-sm text-text-secondary">{t("loginRequired")}</p>
          <button
            type="button"
            onClick={() => openAuthModal()}
            className="mt-2 inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            {t("login")}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto flex flex-1 flex-col px-4 py-6 lg:py-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary lg:text-2xl">{t("title")}</h1>
          <p className="mt-1 text-xs text-text-secondary lg:text-sm">
            {unreadCount > 0 ? t("unreadCount", { count: unreadCount }) : t("allCaughtUp")}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
          >
            <CheckCheck className="h-4 w-4" />
            {t("markAllRead")}
          </button>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {initialLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[88px] animate-pulse rounded-2xl border border-border bg-surface"
              />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-border bg-white p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface">
              <Bell className="h-8 w-8 text-text-secondary/50" />
            </div>
            <h2 className="text-base font-semibold text-text-primary">{t("empty")}</h2>
            <p className="max-w-xs text-sm text-text-secondary">{t("emptyDescription")}</p>
            {!initialLoading && (
              <button
                type="button"
                onClick={handleRetry}
                disabled={retrying}
                className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-text-primary transition-colors hover:border-primary/30 hover:bg-primary/5 disabled:opacity-60"
              >
                <RotateCw className={cn("h-3.5 w-3.5", retrying && "animate-spin")} />
                {retrying ? t("loading") : t("retry")}
              </button>
            )}
          </div>
        ) : (
          <>
            {notifications.map((n) => (
              <div key={n.id} onClick={() => handleClick(n)}>
                <NotificationItemRow
                  notification={n}
                  onRead={handleRead}
                  onDelete={handleDelete}
                />
              </div>
            ))}

            {page < lastPage && (
              <button
                type="button"
                onClick={loadNextPage}
                disabled={loading}
                className={cn(
                  "mt-2 inline-flex items-center justify-center gap-2 rounded-full border border-border bg-white py-3 text-sm font-semibold text-text-primary transition-colors",
                  "hover:border-primary/30 hover:bg-primary/5 disabled:opacity-60",
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("loading")}
                  </>
                ) : (
                  t("loadMore")
                )}
              </button>
            )}

            {total > 0 && (
              <p className="mt-2 text-center text-[11px] text-text-secondary/70">
                {t("showing", { shown: notifications.length, total })}
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}
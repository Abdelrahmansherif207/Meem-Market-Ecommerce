"use client";

import { useRef, useState, useCallback } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useClickOutside } from "@/shared/hooks/useClickOutside";
import { useNotificationStore } from "../store/useNotificationStore";
import { getNotificationConfig } from "../constants";
import { timeAgo } from "@/shared/utils/timeAgo";
import { cn } from "@/shared/utils/cn";
import { notificationService } from "../services/notificationService";
import type { NotificationItem } from "../types";

export function NotificationBell() {
  const t = useTranslations("notifications");
  const locale = useLocale();
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const notifications = useNotificationStore((s) => s.notifications);
  const initialLoading = useNotificationStore((s) => s.initialLoading);

  const [open, setOpen] = useState(false);
  const [marking, setMarking] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);
  useClickOutside(containerRef, close, open);

  if (!isAuthenticated) return null;

  const recent = notifications.slice(0, 5);
  const hasUnread = unreadCount > 0;

  const handleMarkAllRead = async () => {
    setMarking(true);
    try {
      await notificationService.markAllAsRead(locale);
      useNotificationStore.getState().markAllAsRead();
    } catch {
      /* ignore */
    } finally {
      setMarking(false);
    }
  };

  const handleClick = (n: NotificationItem) => {
    const config = getNotificationConfig(n.type);
    const href = config.getActionUrl(n);
    setOpen(false);
    router.push(href);
    if (!n.readAt) {
      useNotificationStore.getState().markAsRead(n.id);
      notificationService.markAsRead(n.id, locale).catch(() => {});
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={t("title")}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border shadow-sm transition-all duration-200",
          open
            ? "border-primary/40 bg-primary/10 text-primary"
            : "border-[rgb(var(--color-primary)/0.1)] bg-transparent text-text-primary hover:border-primary/25 hover:bg-primary/5",
        )}
      >
        <Bell className="h-5 w-5" />

        {initialLoading ? (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-white ring-2 ring-background">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
          </span>
        ) : hasUnread ? (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-white ring-2 ring-background">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open && (
        <div className="absolute end-0 top-12 z-50 w-[min(92vw,360px)] overflow-hidden rounded-2xl border border-border bg-white shadow-2xl shadow-black/10">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold text-text-primary">{t("title")}</h3>
            {hasUnread && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={marking}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                {t("markAllRead")}
              </button>
            )}
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {recent.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface">
                  <Bell className="h-6 w-6 text-text-secondary/50" />
                </div>
                <p className="text-sm font-medium text-text-primary">{t("empty")}</p>
                <p className="text-xs text-text-secondary">{t("emptyDescription")}</p>
              </div>
            ) : (
              <ul className="divide-y divide-border-subtle">
                {recent.map((n) => {
                  const config = getNotificationConfig(n.type);
                  const Icon = config.icon;
                  const isUnread = !n.readAt;
                  return (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => handleClick(n)}
                        className="group flex w-full items-start gap-3 px-4 py-3 text-start transition-colors hover:bg-surface/80"
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                            config.className,
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={cn(
                              "block truncate text-sm font-medium",
                              isUnread ? "text-text-primary" : "text-text-secondary",
                            )}
                          >
                            {n.title}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-text-secondary">
                            {n.message}
                          </span>
                          <span className="mt-1 block text-[11px] text-text-secondary/70">
                            {timeAgo(n.createdAt, locale)}
                          </span>
                        </span>
                        {isUnread && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="border-t border-border px-4 py-2.5">
            <Link
              href="/notifications"
              onClick={close}
              className="flex w-full items-center justify-center rounded-full bg-primary py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              {t("viewAll")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
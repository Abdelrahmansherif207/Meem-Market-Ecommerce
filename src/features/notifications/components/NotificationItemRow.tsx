"use client";

import { CheckCheck, Trash2 } from "lucide-react";
import { useLocale } from "next-intl";
import { getNotificationConfig } from "../constants";
import { timeAgo } from "@/shared/utils/timeAgo";
import { cn } from "@/shared/utils/cn";
import type { NotificationItem } from "../types";

export function NotificationItemRow({
  notification,
  onRead,
  onDelete,
}: {
  notification: NotificationItem;
  onRead: (n: NotificationItem) => void;
  onDelete: (n: NotificationItem) => void;
}) {
  const locale = useLocale();
  const config = getNotificationConfig(notification.type);
  const Icon = config.icon;
  const isUnread = !notification.readAt;

  return (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-2xl border p-4 transition-all duration-200",
        isUnread
          ? "border-primary/20 bg-primary/[0.03]"
          : "border-border bg-white hover:border-border-light",
      )}
    >
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          config.className,
        )}
      >
        <Icon className="h-5 w-5" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p
            className={cn(
              "text-sm font-semibold",
              isUnread ? "text-text-primary" : "text-text-secondary",
            )}
          >
            {notification.title}
          </p>
          {isUnread && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-text-secondary">
          {notification.message}
        </p>
        <p className="mt-1.5 text-[11px] text-text-secondary/70">
          {timeAgo(notification.createdAt, locale)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {isUnread && (
          <button
            type="button"
            aria-label="Mark as read"
            onClick={() => onRead(notification)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary/70 transition-colors hover:bg-primary/10 hover:text-primary"
          >
            <CheckCheck className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          aria-label="Delete"
          onClick={() => onDelete(notification)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary/70 transition-colors hover:bg-error/10 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
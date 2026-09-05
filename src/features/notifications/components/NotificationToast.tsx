"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { getNotificationConfig } from "../constants";
import { useToastStore } from "../store/useToastStore";
import { useNotificationStore } from "../store/useNotificationStore";
import { notificationService } from "../services/notificationService";
import { cn } from "@/shared/utils/cn";
import type { ToastItem } from "../store/useToastStore";

const AUTO_DISMISS_MS = 5000;

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const { notification } = toast;
  const config = getNotificationConfig(notification.type);
  const Icon = config.icon;
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    const timer = window.setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [onDismiss]);

  const handleClick = () => {
    const href = config.getActionUrl(notification);
    onDismiss();
    router.push(href);
    if (!notification.readAt) {
      useNotificationStore.getState().markAsRead(notification.id);
      notificationService.markAsRead(notification.id, locale).catch(() => {});
    }
  };

  return (
    <div
      role="status"
      className="pointer-events-auto flex w-[min(92vw,360px)] cursor-pointer items-start gap-3 overflow-hidden rounded-2xl border border-border bg-white p-4 shadow-2xl shadow-black/10"
      onClick={handleClick}
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
        <p className="text-sm font-semibold text-text-primary">{notification.title}</p>
        <p className="mt-0.5 line-clamp-2 text-xs text-text-secondary">
          {notification.message}
        </p>
      </div>
      <button
        type="button"
        aria-label="Close"
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
        className="shrink-0 rounded-full p-1 text-text-secondary/60 transition-colors hover:bg-surface hover:text-text-primary"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function NotificationToast() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  return (
    <div className="pointer-events-none fixed bottom-6 end-4 z-[200] flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastCard
          key={toast.id}
          toast={toast}
          onDismiss={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
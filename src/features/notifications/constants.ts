import {
  Bell,
  Box,
  CreditCard,
  Hourglass,
  RefreshCw,
  ShoppingCart,
  Star,
  Tag,
  TrendingDown,
  Truck,
  XCircle,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { NotificationItem } from "./types";

/** Single landing route for every notification click (inbox page). */
export const NOTIFICATIONS_INBOX_PATH = "/notifications";

export interface NotificationTypeConfig {
  icon: LucideIcon;
  className: string;
  getActionUrl: (n: NotificationItem) => string;
}

const DEFAULT_CONFIG: NotificationTypeConfig = {
  icon: Bell,
  className: "bg-primary/10 text-primary",
  getActionUrl: () => NOTIFICATIONS_INBOX_PATH,
};

export const NOTIFICATION_TYPE_MAP: Record<string, NotificationTypeConfig> = {
  "order.created": {
    icon: ShoppingCart,
    className: "bg-primary/10 text-primary",
    getActionUrl: () => NOTIFICATIONS_INBOX_PATH,
  },
  "payment.succeeded": {
    icon: CreditCard,
    className: "bg-emerald-500/10 text-emerald-600",
    getActionUrl: () => NOTIFICATIONS_INBOX_PATH,
  },
  "payment.failed": {
    icon: CreditCard,
    className: "bg-red-500/10 text-red-600",
    getActionUrl: () => NOTIFICATIONS_INBOX_PATH,
  },
  "order.delivered": {
    icon: Truck,
    className: "bg-blue-500/10 text-blue-600",
    getActionUrl: () => NOTIFICATIONS_INBOX_PATH,
  },
  "order.cancelled": {
    icon: XCircle,
    className: "bg-red-500/10 text-red-600",
    getActionUrl: () => NOTIFICATIONS_INBOX_PATH,
  },
  "order.refunded": {
    icon: RefreshCw,
    className: "bg-amber-500/10 text-amber-600",
    getActionUrl: () => NOTIFICATIONS_INBOX_PATH,
  },
  "coupon.assigned": {
    icon: Tag,
    className: "bg-fuchsia-500/10 text-fuchsia-600",
    getActionUrl: () => NOTIFICATIONS_INBOX_PATH,
  },
  "coupon.available": {
    icon: Tag,
    className: "bg-fuchsia-500/10 text-fuchsia-600",
    getActionUrl: () => NOTIFICATIONS_INBOX_PATH,
  },
  "coupon.used": {
    icon: Tag,
    className: "bg-slate-500/10 text-slate-600",
    getActionUrl: () => NOTIFICATIONS_INBOX_PATH,
  },
  "promotion.available": {
    icon: Tag,
    className: "bg-violet-500/10 text-violet-600",
    getActionUrl: () => NOTIFICATIONS_INBOX_PATH,
  },
  "flash_sale.available": {
    icon: Zap,
    className: "bg-orange-500/10 text-orange-600",
    getActionUrl: () => NOTIFICATIONS_INBOX_PATH,
  },
  "review.approved": {
    icon: Star,
    className: "bg-yellow-500/10 text-yellow-600",
    getActionUrl: () => NOTIFICATIONS_INBOX_PATH,
  },
  "review.rejected": {
    icon: Star,
    className: "bg-red-500/10 text-red-600",
    getActionUrl: () => NOTIFICATIONS_INBOX_PATH,
  },
  "discount.changed": {
    icon: Tag,
    className: "bg-violet-500/10 text-violet-600",
    getActionUrl: () => NOTIFICATIONS_INBOX_PATH,
  },
  "price.drop": {
    icon: TrendingDown,
    className: "bg-emerald-500/10 text-emerald-600",
    getActionUrl: () => NOTIFICATIONS_INBOX_PATH,
  },
  "back.in.stock": {
    icon: Box,
    className: "bg-teal-500/10 text-teal-600",
    getActionUrl: () => NOTIFICATIONS_INBOX_PATH,
  },
  "promotion.price.drop": {
    icon: Tag,
    className: "bg-violet-500/10 text-violet-600",
    getActionUrl: () => NOTIFICATIONS_INBOX_PATH,
  },
  "flash_sale.price.drop": {
    icon: Zap,
    className: "bg-orange-500/10 text-orange-600",
    getActionUrl: () => NOTIFICATIONS_INBOX_PATH,
  },
  "cart.abandoned": {
    icon: ShoppingCart,
    className: "bg-cyan-500/10 text-cyan-600",
    getActionUrl: () => NOTIFICATIONS_INBOX_PATH,
  },
  "promotion.ending_soon": {
    icon: Hourglass,
    className: "bg-amber-500/10 text-amber-600",
    getActionUrl: () => NOTIFICATIONS_INBOX_PATH,
  },
  "flash_sale.ending_soon": {
    icon: Hourglass,
    className: "bg-orange-500/10 text-orange-600",
    getActionUrl: () => NOTIFICATIONS_INBOX_PATH,
  },
};

export function getNotificationConfig(type: string): NotificationTypeConfig {
  return NOTIFICATION_TYPE_MAP[type] ?? DEFAULT_CONFIG;
}

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

export interface NotificationTypeConfig {
  icon: LucideIcon;
  className: string;
  getActionUrl: (n: NotificationItem) => string;
}

const DEFAULT_CONFIG: NotificationTypeConfig = {
  icon: Bell,
  className: "bg-primary/10 text-primary",
  getActionUrl: (n) => n.actionUrl,
};

export const NOTIFICATION_TYPE_MAP: Record<string, NotificationTypeConfig> = {
  "order.created": {
    icon: ShoppingCart,
    className: "bg-primary/10 text-primary",
    getActionUrl: (n) => `/orders/${n.resourceId ?? n.orderId ?? ""}`,
  },
  "payment.succeeded": {
    icon: CreditCard,
    className: "bg-emerald-500/10 text-emerald-600",
    getActionUrl: (n) => `/orders/${n.resourceId ?? n.orderId ?? ""}`,
  },
  "payment.failed": {
    icon: CreditCard,
    className: "bg-red-500/10 text-red-600",
    getActionUrl: (n) => `/orders/${n.resourceId ?? n.orderId ?? ""}`,
  },
  "order.delivered": {
    icon: Truck,
    className: "bg-blue-500/10 text-blue-600",
    getActionUrl: (n) => `/orders/${n.resourceId ?? n.orderId ?? ""}`,
  },
  "order.cancelled": {
    icon: XCircle,
    className: "bg-red-500/10 text-red-600",
    getActionUrl: (n) => `/orders/${n.resourceId ?? n.orderId ?? ""}`,
  },
  "order.refunded": {
    icon: RefreshCw,
    className: "bg-amber-500/10 text-amber-600",
    getActionUrl: (n) => `/refunds/${n.resourceId ?? n.refundId ?? ""}`,
  },
  "coupon.assigned": {
    icon: Tag,
    className: "bg-fuchsia-500/10 text-fuchsia-600",
    getActionUrl: (n) => `/coupons/${n.resourceId ?? n.couponId ?? ""}`,
  },
  "coupon.available": {
    icon: Tag,
    className: "bg-fuchsia-500/10 text-fuchsia-600",
    getActionUrl: (n) => `/coupons/${n.resourceId ?? n.couponId ?? ""}`,
  },
  "coupon.used": {
    icon: Tag,
    className: "bg-slate-500/10 text-slate-600",
    getActionUrl: (n) => `/coupons/${n.resourceId ?? n.couponId ?? ""}`,
  },
  "promotion.available": {
    icon: Tag,
    className: "bg-violet-500/10 text-violet-600",
    getActionUrl: (n) => `/promotions/${n.resourceId ?? n.promotionId ?? ""}`,
  },
  "flash_sale.available": {
    icon: Zap,
    className: "bg-orange-500/10 text-orange-600",
    getActionUrl: (n) => `/flash-sales/${n.resourceId ?? n.flashSaleId ?? ""}`,
  },
  "review.approved": {
    icon: Star,
    className: "bg-yellow-500/10 text-yellow-600",
    getActionUrl: (n) => `/reviews/${n.resourceId ?? n.reviewId ?? ""}`,
  },
  "review.rejected": {
    icon: Star,
    className: "bg-red-500/10 text-red-600",
    getActionUrl: (n) => `/reviews/${n.resourceId ?? n.reviewId ?? ""}`,
  },
  "discount.changed": {
    icon: Tag,
    className: "bg-violet-500/10 text-violet-600",
    getActionUrl: (n) => n.actionUrl,
  },
  "price.drop": {
    icon: TrendingDown,
    className: "bg-emerald-500/10 text-emerald-600",
    getActionUrl: (n) => n.actionUrl,
  },
  "back.in.stock": {
    icon: Box,
    className: "bg-teal-500/10 text-teal-600",
    getActionUrl: (n) => n.actionUrl,
  },
  "promotion.price.drop": {
    icon: Tag,
    className: "bg-violet-500/10 text-violet-600",
    getActionUrl: (n) => `/promotions/${n.resourceId ?? n.promotionId ?? ""}`,
  },
  "flash_sale.price.drop": {
    icon: Zap,
    className: "bg-orange-500/10 text-orange-600",
    getActionUrl: (n) => `/flash-sales/${n.resourceId ?? n.flashSaleId ?? ""}`,
  },
  "cart.abandoned": {
    icon: ShoppingCart,
    className: "bg-cyan-500/10 text-cyan-600",
    getActionUrl: () => "/cart",
  },
  "promotion.ending_soon": {
    icon: Hourglass,
    className: "bg-amber-500/10 text-amber-600",
    getActionUrl: (n) => `/promotions/${n.resourceId ?? n.promotionId ?? ""}`,
  },
  "flash_sale.ending_soon": {
    icon: Hourglass,
    className: "bg-orange-500/10 text-orange-600",
    getActionUrl: (n) => `/flash-sales/${n.resourceId ?? n.flashSaleId ?? ""}`,
  },
};

export function getNotificationConfig(type: string): NotificationTypeConfig {
  return NOTIFICATION_TYPE_MAP[type] ?? DEFAULT_CONFIG;
}
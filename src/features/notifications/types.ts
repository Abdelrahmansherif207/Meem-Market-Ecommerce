export type NotificationType =
  | "order.created"
  | "payment.succeeded"
  | "payment.failed"
  | "order.delivered"
  | "order.cancelled"
  | "order.refunded"
  | "coupon.assigned"
  | "coupon.available"
  | "coupon.used"
  | "promotion.available"
  | "flash_sale.available"
  | "review.approved"
  | "review.rejected"
  | "discount.changed"
  | "price.drop"
  | "back.in.stock"
  | "promotion.price.drop"
  | "flash_sale.price.drop"
  | "cart.abandoned"
  | "promotion.ending_soon"
  | "flash_sale.ending_soon";

interface NotificationMeta {
  id: string;
  type: string;
  icon: string;
  resource_type: string;
  resource_id: number | null;
  action_url: string;
  order_id?: number | null;
  order_number?: string | null;
  coupon_id?: number | null;
  coupon_code?: string | null;
  product_id?: number | null;
  refund_id?: number | null;
  cart_id?: number | null;
  promotion_id?: number | null;
  flash_sale_id?: number | null;
  review_id?: number | null;
  created_at?: string;
  read_at?: string | null;
}

export interface RawNotification extends NotificationMeta {
  title: string | { en: string; ar: string };
  message: string | { en: string; ar: string };
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  icon: string;
  resourceType: string;
  resourceId: number | null;
  actionUrl: string;
  orderId?: number | null;
  orderNumber?: string | null;
  couponId?: number | null;
  couponCode?: string | null;
  productId?: number | null;
  refundId?: number | null;
  cartId?: number | null;
  promotionId?: number | null;
  flashSaleId?: number | null;
  reviewId?: number | null;
  createdAt?: string;
  readAt?: string | null;
}

export interface NotificationUnreadResponse {
  count: number;
}

export interface NotificationListResponse {
  data: NotificationItem[];
  links: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
  };
}

export interface RawNotificationListResponse {
  data: RawNotification[];
  links: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
  };
}
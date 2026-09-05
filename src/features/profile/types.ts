export interface Profile {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  is_active: number;
  image: string | null;
  permissions: { id: number; label: string }[];
}

export interface Address {
  id: number;
  title: string;
  address: {
    zip: string;
    city: string;
    state: string;
    country: string;
    street_address: string;
  };
  location?: {
    latitude: number;
    longitude: number;
  };
  customer_id: number;
  created_at: string;
}

export interface CreateAddressPayload {
  title: string;
  customer_id?: number;
  address: {
    zip: string;
    city: string;
    state: string;
    country: string;
    street_address: string;
  };
  location?: {
    latitude: number;
    longitude: number;
  };
}

export type UpdateAddressPayload = CreateAddressPayload;

export interface Order {
  id: number;
  order_number: string;
  status: "pending" | "processing" | "completed" | "delivered" | "cancelled";
  subtotal: number;
  discount: number;
  coupon: unknown | null;
  coupon_discount: number | null;
  coupon_discount_type: string | null;
  promotion_discount: number;
  total: number;
  converted_total: number;
  currency: string;
  base_currency: string;
  catalog_currency: string;
  exchange_rate: string;
  promotion: unknown | null;
  fulfillment_type: "pickup" | "delivery";
  payment_method: string;
  shipping_price: number;
  fast_shipping_fee: number;
  pickup_location: { id: number; store_name: string } | null;
  created_at: string;
  order_items: OrderItem[];
  payment_gateway: string | null;
  order_has_invoice: boolean;
  invoice_id: string | null;
}

export type OrderDetail = Order;

export interface OrderItem {
  id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  converted_unit_price: number;
  converted_total_price: number;
  promotion_discount_amount: number;
  is_gift: boolean;
  promotion_id: number | null;
  product: OrderProduct;
  variant: unknown | null;
}

export interface OrderProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  has_variants: boolean;
  current_price: number;
  currency: {
    id: number;
    code: string;
    name: { en: string; ar: string };
    symbol: { en: string; ar: string };
    country_name: { en: string; ar: string };
    icon: string;
  };
  quantity: number;
  in_stock: boolean;
  discount_active: boolean;
  flash_sale_active: boolean;
  is_fast_shipping_available: boolean;
  ratings: number;
  tags: unknown[];
  image: {
    thumbnail: string;
    original: Record<string, string>;
  };
}

export type ProfileTab = "info" | "orders" | "addresses" | "security" | "invoices";

export interface InvoiceListItem {
  uuid: string;
  invoice_number: string;
  status: "ready" | "generated";
  subtotal: number;
  shipping_price: number;
  total_discount: number;
  total: number;
  currency: string;
  payment_method: string;
  payment_gateway: string | null;
  generated_at: string;
  pdf_generated_at: string | null;
  verification_url: string;
  download_url: string | null;
}

export interface InvoiceDetail extends InvoiceListItem {
  snapshot: InvoiceSnapshot;
}

export interface InvoiceSnapshot {
  snapshot_version: string;
  snapshot_schema: number;
  order: {
    id: number;
    order_number: string;
    status: string;
    payment_status: string;
    fulfillment_status: string;
  };
  customer: { name: string };
  billing_address: InvoiceAddress;
  shipping_address: InvoiceAddress;
  fulfillment: {
    type: string;
    shipping_method: string;
    shipping_price: number;
    fast_shipping_fee: number;
    expected_delivery_at: string | null;
  };
  pickup_location: {
    id: number;
    name: string;
    address: string;
    phone: string;
    coordinates: string;
  } | null;
  items: InvoiceSnapshotItem[];
  pricing_breakdown: {
    subtotal: number;
    promotion_discount: number;
    coupon_discount: number;
    shipping_price: number;
    fast_shipping_fee: number;
    total: number;
    currency: string;
  };
  payment: {
    method: string;
    gateway: string | null;
    paid_at: string | null;
  };
  metadata: Record<string, unknown>;
  audit: Record<string, unknown>;
}

export interface InvoiceAddress {
  street: string | null;
  city: string;
  state: string;
  governorate: string | null;
  zip: string | null;
  country: string;
  coordinates: string | null;
}

export interface InvoiceSnapshotItem {
  product_name: string;
  product_sku: string;
  attributes: unknown | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  is_gift: boolean;
}

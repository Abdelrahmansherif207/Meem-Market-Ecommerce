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
  status: string;
  subtotal: number;
  discount: number;
  total: number;
  promotion: unknown | null;
  created_at: string;
  order_items: OrderItem[];
}

export interface OrderItem {
  id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
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
  price_after_discount: number | null;
  price_after_flash_sale: number | null;
  has_discount: boolean;
  discount_type: string;
  discount_amount: number;
  quantity: number;
  discount_valid: boolean;
  ratings: number;
  image: {
    thumbnail: string;
    original: Record<string, string>;
  };
}

export type ProfileTab = "info" | "orders" | "addresses" | "security";

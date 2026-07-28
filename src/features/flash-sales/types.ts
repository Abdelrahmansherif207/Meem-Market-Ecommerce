export interface FlashSaleImage {
  desktop: string;
  mobile: string;
}

export interface FlashSale {
  id: number;
  name: string;
  description: string;
  slug: string;
  start_date: string;
  end_date: string;
  image: FlashSaleImage;
}

export interface FlashSaleProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  current_price: number;
  has_variants: boolean;
  quantity: number;
  in_stock?: boolean;
  is_fast_shipping_available: boolean;
  ratings: number;
  image: {
    thumbnail: string;
    original: Record<string, string>;
  };
  flash_sale_active?: boolean;
}

export interface FlashSaleDetail extends FlashSale {
  products: FlashSaleProduct[];
}

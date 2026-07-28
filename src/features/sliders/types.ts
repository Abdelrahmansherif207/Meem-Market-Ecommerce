export interface SliderImage {
  desktop: string;
  mobile: string;
}

export interface Slider {
  id: number;
  title: string;
  slug: string;
  image: SliderImage;
}

export interface SliderProduct {
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
  discount_active?: boolean;
  flash_sale_active?: boolean;
}

export interface SliderDetail extends Slider {
  products: SliderProduct[];
}

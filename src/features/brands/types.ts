export interface BrandImage {
  desktop: string;
  mobile: string;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  image: BrandImage;
  status: boolean;
}

export interface BrandProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  price_after_discount: number;
  rating: number;
  image: {
    thumbnail: string;
  };
}

export interface BrandDetail extends Brand {
  products: BrandProduct[];
}

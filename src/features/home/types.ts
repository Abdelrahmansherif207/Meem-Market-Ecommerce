import type { ProductTag } from "@/shared/types";

export interface BannerItem {
  id: string;
  imageSrc: string;
  alt: string;
  title?: string;
  href?: string;
  priority?: boolean;
}

export interface CardSlideItem {
  id: number | string;
  image: {
    desktop: string;
    mobile: string;
  };
  title: string;
  borderColor?: string;
  href?: string;
}

export interface ApiFlashSale {
  id: number;
  name: string;
  discription: string;
  slug: string;
  start_date: string;
  end_date: string;
  image: {
    desktop: string;
    mobile: string;
  };
}

export interface HomeCategory {
  id: number;
  name: string;
  slug: string;
  image: {
    desktop: string;
    mobile: string;
  };
}


export interface ApiProduct {
  id: number;
  name: string;
  slug?: string;
  price: number;
  current_price: number;
  price_after_discount: number;
  price_after_flash_sale: number | null;
  has_discount: boolean;
  has_variants: boolean;
  discount_type: string;
  discount_amount: number;
  quantity: number;
  discount_valid: boolean;
  ratings: number;
  in_stock?: boolean;
  is_fast_shipping_available: boolean;
  tags?: ProductTag[];
  image: {
    thumbnail: string;
    original: Record<string, string>;
  };
}

export interface ProductItem {
  id: number;
  image: string;
  title: string;
  price: number;
  originalPrice: number;
  slug?: string;
  sku?: string;
  inStock?: number;
  stockQuantity?: number;
  hasVariants?: boolean;
  isFastShippingAvailable?: boolean;
  isInStock?: boolean;
  flashSaleActive?: boolean;
  tags?: ProductTag[];
}

export interface BannerProps {
  type?: string;
  title?: string;
  locale: string;
  promotion?: Promotion;
  setting?: SectionFrontSetting;
  endpoint?: string;
}

export interface BannerArrowsProps {
  onPrevious: () => void;
  onNext: () => void;
  className?: string;
  buttonClassName?: string;
  iconClassName?: string;
  previousLabel?: string;
  nextLabel?: string;
  isRtl?: boolean;
  variant?: "hero" | "card";
  strokeWidth?: number;
}

export interface BannerPaginationProps {
  total: number;
  currentIndex: number;
  onSelect: (index: number) => void;
  className?: string;
}

export interface CardSliderProps {
  title?: string;
  items: CardSlideItem[];
  autoplay?: boolean;
  sliderSpeed?: number;
  className?: string;
  cardClassName?: string;
  imageClassName?: string;
  slideSizes?: string;
  showArrows?: boolean;
}

export interface CardGridProps {
  title?: string;
  items: CardSlideItem[];
  className?: string;
  gridClassName?: string;
  cardClassName?: string;
  imageClassName?: string;
  slideSizes?: string;
}

export interface ContentSectionProps {
  title: string;
  type: string;
  locale: string;
  setting?: SectionFrontSetting;
  endpoint?: string;
}

export interface ContentItemProps {
  item: HomeCategory;
  isCircle?: boolean;
}

export interface ProductSliderProps {
  title?: string;
  items: ProductItem[];
  columnsCount?: number;
  badgeText?: string;
  showTimer?: boolean;
  timerEndAt?: string;
  theme?: "light" | "dark";
}

export interface SectionFrontSetting {
  autoplay?: boolean;
  slider_speed?: number;
  columns_count?: number;
  shape?: string;
  show_timer?: boolean;
  timer_end_at?: string;
  theme?: "dark" | "light";
  badge_text?: string;
  layout?: "grid" | "list";
}

export interface SectionSetting {
  front: SectionFrontSetting;
  back?: Record<string, unknown>;
}

export interface HomePageSection {
  id: number;
  type: string;
  title: string;
  endpoint?: string;
  order: number;
  setting?: SectionSetting;
}

export interface HomeContentPage {
  id: number;
  title: string;
  slug: string;
  is_active: boolean;
  sections: HomePageSection[];
}

export interface HeroBannerImage {
  desktop: string;
  mobile: string;
}

export interface HeroBanner {
  id: number;
  title: string;
  slug: string;
  description: string;
  image: HeroBannerImage;
  status: boolean;
}

export interface HeroSwiperProps {
  type: string;
  title?: string;
  locale: string;
  setting?: SectionFrontSetting;
  endpoint?: string;
}

export interface PromotionImage {
  desktop: string;
  mobile: string;
}

export interface Promotion {
  id: number;
  name: string;
  slug?: string;
  status: boolean;
  image: PromotionImage;
}

export interface ApiBrandWithProducts {
  id: number;
  name: string;
  slug: string;
  image: PromotionImage;
  status: boolean;
  products: ApiProduct[];
}

export interface ApiCoupon {
  id: number;
  code: string;
  name: string;
  image: {
    desktop: string;
    mobile: string;
  };
  borderColor: string;
  borderless: boolean;
  discount: string;
  discount_type: string;
  max_discount_amount: string | null;
  start_date: string;
  end_date: string;
  limiter: number;
  used: number;
  status: boolean;
  is_valid: boolean;
  created_at: string;
}



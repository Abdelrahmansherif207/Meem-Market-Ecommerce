import type { ProductBrand, ProductTag } from "@/shared/types";
import type { ProductCurrency } from "@/features/currencies";
import type { ProductCardItem } from "@/features/products";

/**
 * CMS front settings carry merchant-editable copy as a locale map. Plain
 * strings remain supported so existing sections keep working unchanged.
 */
export type LocalizedText =
  | string
  | {
      en?: string;
      ar?: string;
    };

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
  products_count?: number;
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
  ratings_count?: number;
  brands?: ProductBrand[];
  in_stock?: boolean;
  in_wishlist?: boolean;
  tags?: ProductTag[];
  currency?: ProductCurrency;
  image: {
    thumbnail: string;
    original: Record<string, string>;
  };
}

/**
 * Home adapters keep the historical `ProductItem` name while the canonical
 * card model lives in `features/products`. One shape, one card.
 */
export type ProductItem = ProductCardItem;

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
  slidesPerView?: number;
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
  autoplay?: boolean;
  sliderSpeed?: number;
  /** When true, card price numbers render as skeleton bars. */
  pricesLoading?: boolean;
}

export interface SectionFrontSetting {
  autoplay?: boolean;
  slider_speed?: number;
  columns_count?: number;
  rows_count?: number;
  tablet_columns_count?: number;
  tablet_rows_count?: number;
  mobile_columns_count?: number;
  mobile_rows_count?: number;
  balance_last_row?: boolean;
  shape?: string;
  show_timer?: boolean;
  timer_end_at?: string;
  theme?: "dark" | "light";
  badge_text?: LocalizedText;
  layout?: "grid" | "slider" | "list";

  /* Tier One shared header/link settings */
  subtitle?: LocalizedText;
  show_title?: boolean;
  show_view_all?: boolean;
  action_label?: LocalizedText;
  action_href?: string;
  show_product_count?: boolean;

  /* Tags */
  show_hashtag?: boolean;
  tone?: "default" | "light" | "dark" | "berry";

  /* Hero */
  media_type?: "video" | "image";
  loop?: boolean;
  muted?: boolean;
  video_desktop?: string;
  video_mobile?: string;
  poster?: string;
  image_desktop?: string;
  image_mobile?: string;
  eyebrow?: LocalizedText;
  heading?: LocalizedText;
  cta_label?: LocalizedText;
  cta_href?: string;
  show_cta?: boolean;
  show_overlay?: boolean;
  content_align?: "start" | "center" | "end";
  content_position?: "center" | "bottom";
  height?: "compact" | "standard" | "tall";
  show_mobile_content?: boolean;
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



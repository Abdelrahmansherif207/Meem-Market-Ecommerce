"use server";

import { homePageService } from "../services/homePageService";
import { flashSaleService } from "@/features/flash-sales/services/flashSaleService";
import { toProductItem } from "../utils";
import type {
  ApiBrandWithProducts,
  ApiFlashSale,
  ApiProduct,
  ProductItem,
} from "../types";
import type { BannerDetail } from "@/features/banners/types";
import type { FlashSaleProduct } from "@/features/flash-sales/types";

/**
 * Home-section product reads in an explicit guest currency.
 *
 * The currency arrives as a plain argument from the calling client island
 * (the server stores nothing — no cookies, no globals) and is forwarded
 * as `X-Currency` via the services. Results bypass the shared Data Cache.
 * Failures throw so islands keep their previously rendered prices.
 */

function normalizeProducts(
  response: ApiProduct[] | { data: ApiProduct[] } | null,
): ApiProduct[] {
  const products =
    response && !Array.isArray(response) && "data" in response
      ? response.data
      : response;
  return Array.isArray(products) ? products : [];
}

function flashProductToProductItem(p: FlashSaleProduct): ProductItem {
  return {
    id: p.id,
    image: Object.values(p.image.original)[0] || p.image.thumbnail,
    title: p.name,
    price: p.current_price,
    originalPrice: p.price,
    slug: p.slug,
    hasVariants: p.has_variants,
    isInStock: p.in_stock ?? p.quantity > 0,
    flashSaleActive: p.flash_sale_active ?? false,
    inWishlist: p.in_wishlist,
    inStock: p.quantity,
    stockQuantity: p.quantity,
    tags: p.tags,
    currency: p.currency,
  };
}

export async function getProductSliderItemsAction(
  endpoint: string,
  locale: string,
  currency: string | null | undefined,
): Promise<ProductItem[]> {
  const response = await homePageService.fetchSectionData<
    ApiProduct[] | { data: ApiProduct[] }
  >(endpoint, locale, currency ?? undefined);
  return normalizeProducts(response).map(toProductItem);
}

export async function getFlashSaleHomeItemsAction(
  endpoint: string,
  locale: string,
  currency: string | null | undefined,
): Promise<ProductItem[]> {
  const code = currency ?? undefined;
  const flashSales = await homePageService.fetchSectionData<ApiFlashSale[]>(
    endpoint,
    locale,
    code,
  );
  const firstSlug = flashSales[0]?.slug;
  if (!firstSlug) return [];
  const detail = await flashSaleService.getFlashSale(firstSlug, locale, code);
  return (detail.products ?? []).map(flashProductToProductItem);
}

export async function getBannerSectionItemsAction(
  endpoint: string,
  locale: string,
  currency: string | null | undefined,
): Promise<ProductItem[]> {
  const data = await homePageService.fetchSectionData<
    BannerDetail | BannerDetail[]
  >(endpoint, locale, currency ?? undefined);
  const banner = Array.isArray(data) ? data[0] : data;
  return (banner?.products ?? []).map((p) => ({
    id: p.id,
    image: Object.values(p.image.original)[0] || p.image.thumbnail,
    title: p.name,
    price: p.current_price,
    originalPrice: p.price,
    slug: p.slug,
    hasVariants: p.has_variants,
    isInStock: p.in_stock ?? p.quantity > 0,
    flashSaleActive: p.flash_sale_active ?? false,
    inWishlist: p.in_wishlist,
    inStock: p.quantity,
    stockQuantity: p.quantity,
    tags: p.tags,
    currency: p.currency,
  }));
}

export interface BrandProductBlock {
  id: number;
  name: string;
  items: ProductItem[];
}

export async function getBrandProductBlocksAction(
  endpoint: string,
  kind: "banners" | "brands",
  locale: string,
  currency: string | null | undefined,
): Promise<BrandProductBlock[]> {
  const code = currency ?? undefined;
  if (kind === "banners") {
    const banner = await homePageService.fetchSectionData<{
      id: number;
      title: string;
      slug: string;
      image: { desktop: string; mobile: string };
      status: boolean;
      products: ApiProduct[];
    }>(endpoint, locale, code);
    return [
      {
        id: banner.id,
        name: banner.title,
        items: (banner.products ?? []).map(toProductItem),
      },
    ];
  }
  const brands = await homePageService.fetchSectionData<ApiBrandWithProducts[]>(
    endpoint,
    locale,
    code,
  );
  return brands.map((brand) => ({
    id: brand.id,
    name: brand.name,
    items: (brand.products ?? []).map(toProductItem),
  }));
}

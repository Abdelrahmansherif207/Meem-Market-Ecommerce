"use server";

import { homePageService } from "../services/homePageService";
import { flashSaleService } from "@/features/flash-sales/services/flashSaleService";
import { getHoverImage } from "@/features/products/utils";
import { toProductItem } from "../utils";
import type { ApiFlashSale, ApiProduct, ProductItem } from "../types";
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
  const image =
    Object.values(p.image?.original ?? {})[0] || p.image?.thumbnail || "";
  return {
    id: p.id,
    image,
    hoverImage: getHoverImage(p.image, image),
    title: p.name,
    price: p.current_price,
    originalPrice: p.price,
    slug: p.slug,
    hasVariants: p.has_variants,
    isInStock: p.in_stock ?? p.quantity > 0,
    flashSaleActive: p.flash_sale_active ?? false,
    inWishlist: p.in_wishlist,
    ratings: p.ratings,
    reviewsCount: p.ratings_count,
    brands: p.brands,
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
  return (banner?.products ?? []).map((p) => {
    const image =
      Object.values(p.image?.original ?? {})[0] || p.image?.thumbnail || "";
    return {
      id: p.id,
      image,
      hoverImage: getHoverImage(p.image, image),
      title: p.name,
      price: p.current_price,
      originalPrice: p.price,
      slug: p.slug,
      hasVariants: p.has_variants,
      isInStock: p.in_stock ?? p.quantity > 0,
      flashSaleActive: p.flash_sale_active ?? false,
      inWishlist: p.in_wishlist,
      ratings: p.ratings,
      reviewsCount: p.ratings_count,
      brands: p.brands,
      inStock: p.quantity,
      stockQuantity: p.quantity,
      tags: p.tags,
      currency: p.currency,
    };
  });
}

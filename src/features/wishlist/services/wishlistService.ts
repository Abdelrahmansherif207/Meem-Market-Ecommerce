import { apiFetch, ApiError } from "@/shared/lib/api";
import type { ApiResponse } from "@/shared/types";
import type { WishlistResponse, WishlistItem, WishlistProduct } from "../types";

/**
 * Normalizes a wishlist item regardless of whether the API nests the product
 * inside a `product` key or flattens the fields onto the item itself.
 */
type RawRecord = Record<string, unknown>;

function asRecord(value: unknown): RawRecord {
  return value && typeof value === "object" ? (value as RawRecord) : {};
}

function toNumber(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/** Resolves a product thumbnail from the `image` object or the `images` array/string. */
function resolveImage(item: RawRecord): WishlistProduct["image"] {
  const image = item.image as WishlistProduct["image"] | undefined;
  if (image && typeof image === "object" && (image.thumbnail || image.original)) {
    return image;
  }
  const images = item.images;
  if (Array.isArray(images)) {
    const first = images[0];
    if (typeof first === "string" && first) return { thumbnail: first };
  }
  if (typeof images === "string" && images) return { thumbnail: images };
  return { thumbnail: "" };
}

function normalizeItem(raw: unknown): WishlistItem {
  if (!raw) {
    return {
      id: 0,
      product_id: 0,
      product_variant_id: null,
      product: { id: 0, name: "", slug: "", price: 0, current_price: 0, image: { thumbnail: "" } },
    };
  }
  const item = asRecord(raw);

  if (item.product && typeof item.product === "object") {
    const nested = asRecord(item.product);
    return {
      id: (item.id as number) ?? 0,
      product_id: (item.product_id as number) ?? (nested.id as number) ?? 0,
      product_variant_id: (item.product_variant_id as number | null | undefined) ?? null,
      product: { ...(nested as unknown as WishlistProduct), image: resolveImage(nested) },
    };
  }
  const product: WishlistProduct = {
    id: item.id as number,
    name: (item.name as string) ?? (item.product_name as string) ?? "",
    slug: (item.slug as string) ?? "",
    price: (item.price as number) ?? 0,
    current_price: (item.current_price as number) ?? (item.price as number) ?? 0,
    price_after_discount: (item.price_after_discount as number | null) ?? null,
    price_after_flash_sale: (item.price_after_flash_sale as number | null) ?? null,
    has_discount: (item.has_discount as boolean) ?? false,
    has_flash_sale: (item.has_flash_sale as boolean) ?? false,
    quantity: item.quantity as number,
    in_stock: item.in_stock === undefined ? undefined : Boolean(item.in_stock),
    image: resolveImage(item),
  };
  return {
    id: (item.id as number) ?? (item.product_id as number),
    product_id: (item.product_id as number) ?? (item.id as number),
    product_variant_id: (item.product_variant_id as number | null | undefined) ?? null,
    product,
  };
}

function normalizeResponse(raw: unknown): WishlistResponse {
  const root = asRecord(raw);
  const payload = (root.data as unknown) ?? root;
  if (Array.isArray(payload)) {
    return {
      data: payload.map(normalizeItem),
      links: root.links as WishlistResponse["links"],
      meta: root.meta as WishlistResponse["meta"],
    };
  }
  const paginated = asRecord(payload);
  const data = Array.isArray(paginated.data) ? paginated.data : [];
  const items = data.map(normalizeItem);
  const meta: WishlistResponse["meta"] = paginated.meta as WishlistResponse["meta"] ?? {
    current_page: toNumber(paginated.current_page, 1),
    last_page: toNumber(paginated.last_page, 1),
    total: toNumber(paginated.total, items.length),
    per_page: toNumber(paginated.per_page, items.length),
    from: (paginated.from as number | null | undefined) ?? null,
    to: (paginated.to as number | null | undefined) ?? null,
    path: paginated.path as string | undefined,
  };
  return {
    data: items,
    links: (paginated.links as WishlistResponse["links"]) ?? (root.links as WishlistResponse["links"]),
    meta,
  };
}

export const wishlistService = {
  /** GET /api/v1/wishlists — returns 401 for guests. */
  getWishlists: async (lang?: string, page = 1): Promise<WishlistResponse> => {
    const response = await apiFetch<ApiResponse<WishlistResponse>>(
      `/wishlists?page=${page}`,
      { lang, next: { revalidate: 0 } },
    );
    return normalizeResponse(response);
  },

  /** GET /api/v1/wishlists/in_wishlist/{product_id} — public, guest-safe. */
  getInWishlist: async (productId: number, lang?: string): Promise<boolean> => {
    const response = await apiFetch<ApiResponse<unknown>>(
      `/wishlists/in_wishlist/${productId}`,
      { lang, next: { revalidate: 0 } },
    );
    const data = response?.data as unknown;
    if (typeof data === "boolean") return data;
    return Boolean(asRecord(data).in_wishlist);
  },

  /** POST /api/v1/wishlists — body { product_id } or { product_id, product_variant_id }. */
  add: async (
    productId: number,
    productVariantId?: number | null,
    lang?: string,
  ): Promise<void> => {
    await apiFetch<ApiResponse<{ message: string }>>("/wishlists", {
      method: "POST",
      body: JSON.stringify({
        product_id: productId,
        ...(productVariantId ? { product_variant_id: productVariantId } : {}),
      }),
      lang,
    });
  },

  /** PATCH /api/v1/wishlists/toggle — toggles a product (used by product cards). */
  toggle: async (
    productId: number,
    lang?: string,
  ): Promise<{ in_wishlist: boolean }> => {
    const response = await apiFetch<ApiResponse<unknown>>(
      "/wishlists/toggle",
      { method: "PATCH", body: JSON.stringify({ product_id: productId }), lang },
    );
    const data = response?.data as unknown;
    if (typeof data === "boolean") return { in_wishlist: data };
    const record = asRecord(data);
    if (typeof record.in_wishlist === "boolean") {
      return { in_wishlist: record.in_wishlist };
    }
    // The toggle response carries no `data` — the direction is only reported
    // through the message ("Added ..." / "Removed ...").
    const message = response?.message ?? "";
    if (typeof message === "string") {
      if (message.includes("Added")) return { in_wishlist: true };
      if (message.includes("Removed")) return { in_wishlist: false };
    }
    return { in_wishlist: false };
  },

  /**
   * Removes an item via PATCH /api/v1/wishlists/toggle (the backend has no
   * dedicated DELETE route). Toggle requires both product_id and the matching
   * product_variant_id.
   */
  remove: async (
    productId: number,
    productVariantId?: number | null,
    lang?: string,
  ): Promise<void> => {
    await apiFetch<ApiResponse<unknown>>("/wishlists/toggle", {
      method: "PATCH",
      body: JSON.stringify({
        product_id: productId,
        ...(productVariantId ? { product_variant_id: productVariantId } : {}),
      }),
      lang,
    });
  },

  isDuplicateError: (err: unknown): boolean =>
    err instanceof ApiError && err.status === 400,

  isUnauthorizedError: (err: unknown): boolean =>
    err instanceof ApiError && err.status === 401,

  isNotFoundError: (err: unknown): boolean =>
    err instanceof ApiError && err.status === 404,
};

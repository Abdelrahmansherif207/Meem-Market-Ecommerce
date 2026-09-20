import type { PriceInfo } from "./types";

export function getDisplayPrice(product: PriceInfo): number {
  if (product.has_flash_sale && product.price_after_flash_sale != null) {
    return product.price_after_flash_sale;
  }
  if (product.has_discount && product.price_after_discount != null) {
    return product.price_after_discount;
  }
  return product.current_price;
}

export function getOriginalPrice(product: PriceInfo): number {
  return product.price;
}

export function getDiscountPercent(product: PriceInfo): number | null {
  const display = getDisplayPrice(product);
  const original = getOriginalPrice(product);
  if (original <= 0 || display >= original) return null;
  return Math.round(((original - display) / original) * 100);
}

export function getSortedImages(product: { images: { original: Record<string, string> } }): string[] {
  const keys = Object.keys(product.images.original).sort(
    (a, b) => Number(a) - Number(b),
  );
  return keys.map((k) => product.images.original[k]);
}

export function getAverageRating(reviews: { rating: number }[]): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

export function getVariantPriceRange(variants: { current_price: number }[]): { min: number; max: number } | null {
  if (variants.length === 0) return null;
  let min = Infinity;
  let max = -Infinity;
  for (const v of variants) {
    if (v.current_price < min) min = v.current_price;
    if (v.current_price > max) max = v.current_price;
  }
  return { min, max };
}

export function getStockStatus(product: { in_stock: boolean; quantity: number; sold_quantity: number }): {
  inStock: boolean;
  remaining: number;
} {
  const remaining = product.quantity - product.sold_quantity;
  return {
    inStock: product.in_stock && remaining > 0,
    remaining: Math.max(0, remaining),
  };
}

/**
 * Resolve a product `description` payload to final HTML for the given locale.
 *
 * The API normally returns already-localized HTML (via the `lang` header),
 * but some rows come back as a JSON-encoded locale map, e.g.
 * `"{\"en\":\"<p>..</p>\",\"ar\":\"<p>..</p>\"}"`. This handles both shapes
 * (plus a plain object, for defensiveness) and always returns an HTML string.
 */
export function resolveProductDescriptionHtml(
  raw: string | Record<string, string> | null | undefined,
  locale?: string,
): string {
  if (raw == null) return "";
  if (typeof raw === "object") {
    const lang = (locale ?? "en").toLowerCase();
    return raw[lang] ?? raw.en ?? raw.ar ?? Object.values(raw)[0] ?? "";
  }
  const trimmed = raw.trim();
  if (!trimmed) return "";
  // Heuristic: JSON locale map starts with { and contains en/ar keys.
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const map = parsed as Record<string, unknown>;
        const lang = (locale ?? "en").toLowerCase();
        const pick =
          map[lang] ?? map[lang.split("-")[0]] ?? map.en ?? map.ar ?? Object.values(map)[0];
        return typeof pick === "string" ? pick : "";
      }
    } catch {
      // Not actually JSON — fall through and treat as HTML.
    }
  }
  return raw;
}

/**
 * Minimal SSR-safe sanitizer for backend-provided product HTML.
 * Blocklist approach: strip actively dangerous tags/attributes while
 * preserving formatting tags (`p`, `ul`, `ol`, `li`, `strong`, ...).
 */
export function sanitizeProductHtml(html: string): string {
  if (!html) return "";
  let out = html;
  // Remove dangerous element bodies entirely.
  out = out.replace(/<(script|style|iframe|object|embed|form|input|button|link|meta|noscript)[^>]*>[\s\S]*?<\/\1\s*>/gi, "");
  out = out.replace(/<(script|style|iframe|object|embed|form|input|button|link|meta)[^>]*\/?>/gi, "");
  // Remove event-handler attributes (onclick, onerror, ...) and xmlns.
  out = out.replace(/\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  out = out.replace(/\s+xmlns(:\w+)?\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  // Neutralize javascript:/data:/vbscript: URLs in href/src/action.
  out = out.replace(/\s+(href|src|action)\s*=\s*("javascript:[^"]*"|'javascript:[^']*'|"data:text\/html[^"]*"|'data:text\/html[^']*'|"vbscript:[^"]*"|'vbscript:[^']*')/gi, ' $1="#"');
  return out.trim();
}

/** Strip all HTML tags + decode common entities for plain-text previews / SEO. */
export function stripProductHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1\s*>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|div|li|ul|ol|h1|h2|h3|h4|h5|h6|tr|table)>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}
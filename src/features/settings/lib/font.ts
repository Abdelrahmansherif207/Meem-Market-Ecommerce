import { cache } from "react";
import { apiFetch } from "@/shared/lib/api";
import { CACHE_TTL } from "@/shared/constants/cache";
import type { ApiResponse } from "@/shared/types";
import { FONT_CACHE_TAG } from "../constants";
import type { CustomFont, CustomFontFormat, RawCustomFont } from "../types";

/**
 * Allowlisted stylesheet hosts for `source_type: "link"`, paired with the
 * origins their font files are served from (used for `<link rel="preconnect">`).
 * Extend this list when adding another hosted font provider.
 */
export const FONT_STYLESHEET_HOSTS: ReadonlyArray<{
  host: string;
  fileOrigins: readonly string[];
}> = [{ host: "fonts.googleapis.com", fileOrigins: ["https://fonts.gstatic.com"] }];

/** Quoted family values may only contain letters, numbers, spaces, `-`, `_`. */
const FONT_FAMILY_PATTERN = /^[A-Za-z0-9 _-]+$/;

/** `400` or a range like `100 900`. Anything else falls back to `100 900`. */
const FONT_WEIGHT_PATTERN = /^\d{1,4}( \d{1,4})?$/;
const FONT_WEIGHT_FALLBACK = "100 900";

/** Quotes, escapes, angle brackets and whitespace are never valid in a CSS url(). */
const UNSAFE_CSS_URL_PATTERN = /["'\\<>\s]/;

const CSS_FONT_FORMAT: Record<CustomFontFormat, string> = {
  woff2: "woff2",
  woff: "woff",
  truetype: "truetype",
  opentype: "opentype",
};

/** Derives the CSS format from the (validated) file extension. */
function getFileFormat(pathname: string): CustomFontFormat | null {
  const lower = pathname.toLowerCase();
  if (lower.endsWith(".woff2")) return "woff2";
  if (lower.endsWith(".woff")) return "woff";
  if (lower.endsWith(".ttf")) return "truetype";
  if (lower.endsWith(".otf")) return "opentype";
  return null;
}

function parseHttpsUrl(rawUrl: string | null | undefined): URL | null {
  const value = rawUrl?.trim();
  if (!value || UNSAFE_CSS_URL_PATTERN.test(value)) return null;

  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

/**
 * Validates a raw payload. Any invalid family, source, URL, host or extension
 * rejects the whole font so the storefront keeps its built-in typography.
 */
function normalizeFont(raw: RawCustomFont | null | undefined): CustomFont | null {
  if (!raw) return null;

  const family = raw.family?.trim().replace(/\s+/g, " ");
  if (!family || !FONT_FAMILY_PATTERN.test(family)) return null;

  const sourceType = raw.source_type?.trim().toLowerCase();
  if (sourceType !== "file" && sourceType !== "link") return null;

  const url = parseHttpsUrl(raw.url);
  if (!url) return null;

  const weight = raw.weight?.trim();
  const safeWeight =
    weight && FONT_WEIGHT_PATTERN.test(weight) ? weight : FONT_WEIGHT_FALLBACK;
  const updatedAt = raw.updated_at?.trim() || null;

  if (sourceType === "link") {
    const isAllowedHost = FONT_STYLESHEET_HOSTS.some(
      ({ host }) => url.hostname === host,
    );
    if (!isAllowedHost) return null;

    return {
      family,
      source_type: "link",
      url: url.toString(),
      format: null,
      weight: safeWeight,
      updated_at: updatedAt,
    };
  }

  const format = getFileFormat(url.pathname);
  if (!format) return null;

  return {
    family,
    source_type: "file",
    url: url.toString(),
    format,
    weight: safeWeight,
    updated_at: updatedAt,
  };
}

/**
 * Inline `@font-face` rule for uploaded files. Link sources load their own
 * stylesheet, so they produce no CSS here.
 */
export function buildFontCss(font: CustomFont): string {
  if (font.source_type !== "file") return "";

  return [
    "@font-face {",
    `  font-family: "${font.family}";`,
    `  src: url("${font.url}") format("${CSS_FONT_FORMAT[font.format]}");`,
    `  font-weight: ${font.weight};`,
    "  font-style: normal;",
    "  font-display: swap;",
    "}",
  ].join("\n");
}

/** Origins to preconnect to before loading a link-based stylesheet. */
export function getFontPreconnectOrigins(font: CustomFont): string[] {
  if (font.source_type !== "link") return [];

  const { origin, hostname } = new URL(font.url);
  const provider = FONT_STYLESHEET_HOSTS.find(({ host }) => host === hostname);
  return provider ? [origin, ...provider.fileOrigins] : [origin];
}

async function fetchFont(): Promise<CustomFont | null> {
  try {
    const response = await apiFetch<ApiResponse<RawCustomFont | null>>(
      "/public/font",
      {
        next: {
          revalidate: CACHE_TTL.FONT,
          tags: [FONT_CACHE_TAG],
        },
      },
    );

    return normalizeFont(response?.data);
  } catch (error) {
    console.warn("[font] Falling back to the default storefront font", error);
    return null;
  }
}

/**
 * Storefront font from `GET /public/font`.
 *
 * Returns `null` whenever the font is missing, unreachable or fails
 * validation — the site then keeps its built-in font and never breaks.
 * Concurrent calls within one request are deduplicated by React `cache()`.
 */
export const getFont = cache(fetchFont);

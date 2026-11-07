"use client";

/**
 * Compatibility re-export.
 *
 * The canonical product card lives in `features/products`; this path is kept
 * so older imports keep resolving while callers migrate. New code should
 * import `ProductCard` from `@/features/products`.
 */
export { default } from "@/features/products/components/ProductCard";

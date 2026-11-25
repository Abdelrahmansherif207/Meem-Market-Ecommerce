"use client";

import { useEffect, useRef } from "react";
import { trackViewItemList } from "../lib/ecommerce";
import type { GA4EcommerceItem } from "../lib/items";

/**
 * Fire `view_item_list` once per unique list content.
 *
 * - Ref-keyed: immune to re-renders AND to React Strict Mode's double
   effect invocation (the ref survives both runs of the same mount).
 * - Re-fires when the list content actually changes (filters, pagination
   into a fresh set), not when a currency refetch returns the same ids.
 * - Remounting via navigation re-fires — a new pageview legitimately
   viewed the list again.
 */
export function useListImpression(
  items: GA4EcommerceItem[],
  itemListId: string,
  itemListName?: string,
): void {
  const lastKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (items.length === 0) return;
    const key = `${itemListId}:${items.map((item) => item.item_id).join(",")}`;
    if (lastKeyRef.current === key) return;
    lastKeyRef.current = key;
    trackViewItemList(items, { itemListId, itemListName });
  }, [items, itemListId, itemListName]);
}

/**
 * Run a fire-once effect per mount, safe under Strict Mode's double
 * invocation. `key` narrows the guard further (e.g. per currency or term);
 * when the key changes the effect may fire once more.
 */
export function useOncePerKeyEffect(
  key: string | null,
  effect: () => void,
): void {
  const firedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (key === null) return;
    if (firedKeyRef.current === key) return;
    firedKeyRef.current = key;
    effect();
    // effect is intentionally not a dependency: callers pass stable inline
    // closures that capture the data the key describes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

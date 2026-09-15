"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import RetryButton from "@/components/ui/RetryButton";
import { useCurrencyRefetch, useCurrencyStore } from "@/features/currencies";
import { getCategoryPageDataAction } from "../actions/categoryPageData";
import ActiveFilterChips from "./ActiveFilterChips";
import CategoryProducts from "./CategoryProducts";
import type { CategoryProduct } from "../types";

interface ProductsGridIslandProps {
  slug: string;
  locale: string;
  searchParams: Record<string, string | string[] | undefined>;
  filterKey?: "category" | "banner" | "promotion" | "tag";
  initialProducts: CategoryProduct[];
  /** Opaque cursor for the next page; `null` = end of list. */
  initialNextCursor: string | null;
  /** Currency code the server-rendered prices are in (catalog fallback). */
  initialCurrency?: string;
}

/** Start loading before the sentinel enters the viewport. */
const SENTINEL_ROOT_MARGIN = "200px 0px";
const NO_APPENDED_ITEMS: CategoryProduct[] = [];

/**
 * Consecutive scroll-load failures after which auto-loading stops and a
 * manual retry button is shown instead. Guards against hammering a
 * struggling backend (e.g. 429 rate-limit storms): failed attempts still
 * count against the limit, so blind retries would keep it exhausted.
 */
const MAX_CONSECUTIVE_FAILURES = 3;

type SearchParams = Record<string, string | string[] | undefined>;

/**
 * Client island owning cursor-based infinite scroll and currency-driven
 * refetches for the category grid.
 *
 * First paint shows the server's first page (catalog currency). When the
 * sentinel below the grid approaches the viewport, the next cursor page is
 * fetched through the Server Action and appended. Appended items are
 * tagged with the server page they were built on: when a currency refetch
 * replaces that page, the accumulated list resets to the new first page
 * (one cursor request can only return one page). After repeated
 * scroll-load failures the auto-loader pauses and a manual retry button
 * takes over, so a struggling backend (e.g. 429 storms) is not hammered.
 */
export default function ProductsGridIsland({
  slug,
  locale,
  searchParams,
  filterKey,
  initialProducts,
  initialNextCursor,
  initialCurrency,
}: ProductsGridIslandProps) {
  const paramsKey = JSON.stringify(searchParams);
  const t = useTranslations("error");

  const fetchAction = useCallback(
    (currency: string) => {
      const params = JSON.parse(paramsKey) as SearchParams;
      return getCategoryPageDataAction(
        slug,
        locale,
        params,
        filterKey,
        currency,
      ).then((d) => ({ products: d.products, nextCursor: d.nextCursor }));
    },
    [slug, locale, filterKey, paramsKey],
  );

  const { data, isRefreshing } = useCurrencyRefetch(
    fetchAction,
    { products: initialProducts, nextCursor: initialNextCursor },
    initialCurrency,
  );

  // Scroll-appended items, tagged with the server page they extend.
  const [appended, setAppended] = useState<{
    source: unknown;
    items: CategoryProduct[];
  }>({ source: data, items: [] });
  // Cursor token, tagged the same way so a currency swap falls back to the
  // fresh first page's cursor instead of a stale one.
  const [cursorState, setCursorState] = useState<{
    source: unknown;
    token: string | null;
  }>({ source: data, token: initialNextCursor });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  // Consecutive scroll-load failures (render mirror; the ref is the guard).
  const [failures, setFailures] = useState(0);
  const failuresRef = useRef(0);
  const paused = failures >= MAX_CONSECUTIVE_FAILURES;

  const appendedItems = useMemo(
    () => (appended.source === data ? appended.items : NO_APPENDED_ITEMS),
    [appended, data],
  );
  const nextCursor =
    cursorState.source === data ? cursorState.token : data.nextCursor;
  const items = useMemo(
    () => [...data.products, ...appendedItems],
    [data, appendedItems],
  );

  const selectedCurrency = useCurrencyStore((s) => s.selectedCode);

  const inflightRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (inflightRef.current || isRefreshing) return;
    if (failuresRef.current >= MAX_CONSECUTIVE_FAILURES) return;
    const cursor = nextCursor;
    if (!cursor) return;
    inflightRef.current = true;
    setIsLoadingMore(true);
    try {
      const params = JSON.parse(paramsKey) as SearchParams;
      const freshPage = await getCategoryPageDataAction(
        slug,
        locale,
        params,
        filterKey,
        selectedCurrency,
        cursor,
      );
      const seen = new Set(
        [...data.products, ...appendedItems].map((p) => p.id),
      );
      const fresh = freshPage.products.filter((p) => !seen.has(p.id));
      if (fresh.length > 0) {
        setAppended({ source: data, items: [...appendedItems, ...fresh] });
      }
      setCursorState({ source: data, token: freshPage.nextCursor });
      failuresRef.current = 0;
      setFailures(0);
    } catch {
      // Keep accumulated items and cursor. After repeated failures the
      // breaker opens (see `paused`): the observer stops and a manual
      // retry button takes over instead of hammering the backend.
      failuresRef.current += 1;
      setFailures(failuresRef.current);
    } finally {
      inflightRef.current = false;
      setIsLoadingMore(false);
    }
  }, [
    nextCursor,
    isRefreshing,
    paramsKey,
    slug,
    locale,
    filterKey,
    selectedCurrency,
    data,
    appendedItems,
  ]);

  const handleRetryLoadMore = useCallback(() => {
    failuresRef.current = 0;
    setFailures(0);
    void loadMore();
  }, [loadMore]);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !nextCursor || paused) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadMore();
        }
      },
      { rootMargin: SENTINEL_ROOT_MARGIN },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [nextCursor, loadMore, paused]);

  return (
    <>
      <ActiveFilterChips />
      <CategoryProducts
        products={items}
        pricesLoading={isRefreshing}
        isLoadingMore={isLoadingMore && !paused}
      />
      {paused && nextCursor ? (
        <div className="flex flex-col items-center gap-2 py-4 text-center">
          <p className="text-sm text-text-secondary">{t("couldNotLoadMore")}</p>
          <RetryButton compact label={t("retry")} onClick={handleRetryLoadMore} />
        </div>
      ) : null}
      {nextCursor && !paused ? (
        <div ref={sentinelRef} className="h-px w-full" aria-hidden="true" />
      ) : null}
    </>
  );
}

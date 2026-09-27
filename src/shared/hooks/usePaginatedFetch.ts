"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PageMeta } from "@/shared/types";

export interface PaginatedPage<T> {
  items: T[];
  meta: PageMeta;
}

interface UsePaginatedFetchState<T> {
  items: T[];
  meta: PageMeta | null;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
}

interface UsePaginatedFetchOptions<T> {
  /** Skip fetching entirely (e.g. guests). State resets when toggled off. */
  enabled?: boolean;
  /** Change to clear accumulated items and refetch page 1 (filters, locale…). */
  resetKey?: string;
  /** Page size passed to `fetchPage` (backends commonly clamp 1–50). */
  limit?: number;
  /** Optional identity for appending pages without duplicates. */
  getItemId?: (item: T) => string | number;
}

const DEFAULT_LIMIT = 15;

/**
 * Generic page/limit pagination for endpoints shaped
 * `{ data: { data: T[]; meta: PageMeta } }` inside the standard
 * `ApiResponse` envelope. Consumers own the domain: they pass a
 * `fetchPage(page, limit)` callback and decide what `enabled` /
 * `resetKey` mean.
 *
 * Pagination decisions are driven only by `meta.has_more_pages`;
 * `meta.total` is intentionally ignored because some backends scope
 * it to the current page. `loadMore` is guarded against concurrent
 * and duplicate-page fetches; failures keep accumulated items.
 */
export function usePaginatedFetch<T>(
  fetchPage: (page: number, limit: number) => Promise<PaginatedPage<T>>,
  options?: UsePaginatedFetchOptions<T>,
) {
  const enabled = options?.enabled ?? true;
  const limit = options?.limit ?? DEFAULT_LIMIT;
  const resetKey = options?.resetKey ?? "";
  const getItemId = options?.getItemId;

  const [state, setState] = useState<UsePaginatedFetchState<T>>({
    items: [],
    meta: null,
    loading: enabled,
    loadingMore: false,
    error: null,
  });

  const fetchPageRef = useRef(fetchPage);
  fetchPageRef.current = fetchPage;
  const stateRef = useRef(state);
  stateRef.current = state;
  const generationRef = useRef(0);
  const inflightRef = useRef(false);
  const fetchedPagesRef = useRef<Set<number>>(new Set());

  const commit = useCallback((next: UsePaginatedFetchState<T>) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const load = useCallback(
    async (page: number) => {
      if (inflightRef.current) return;
      inflightRef.current = true;
      const generation = generationRef.current;
      commit({ ...stateRef.current, loadingMore: true, error: null });
      try {
        const result = await fetchPageRef.current(page, limit);
        if (generation !== generationRef.current) return;
        fetchedPagesRef.current.add(page);
        let fresh = result.items;
        const snapshot = stateRef.current;
        if (page > 1 && getItemId) {
          const seen = new Set(snapshot.items.map(getItemId));
          fresh = fresh.filter((item) => !seen.has(getItemId(item)));
        }
        commit({
          items: page === 1 ? result.items : [...snapshot.items, ...fresh],
          meta: result.meta,
          loading: false,
          loadingMore: false,
          error: null,
        });
      } catch (error: unknown) {
        if (generation !== generationRef.current) return;
        const message = error instanceof Error ? error.message : null;
        if (page === 1) {
          commit({ items: [], meta: null, loading: false, loadingMore: false, error: message ?? "Request failed" });
        } else {
          commit({ ...stateRef.current, loadingMore: false, error: message ?? "Request failed" });
        }
      } finally {
        inflightRef.current = false;
      }
    },
    [commit, getItemId, limit],
  );

  const loadMore = useCallback(() => {
    const snapshot = stateRef.current;
    if (!enabled || inflightRef.current || snapshot.loading || snapshot.loadingMore || snapshot.error) return;
    if (!snapshot.meta?.has_more_pages) return;
    void load(snapshot.meta.current_page + 1);
  }, [enabled, load]);

  const reload = useCallback(() => {
    if (inflightRef.current || !enabled) return;
    void load(1);
  }, [enabled, load]);

  useEffect(() => {
    // Bump the generation so in-flight requests from a previous
    // enabled/resetKey configuration are discarded instead of committed.
    generationRef.current += 1;
    if (!enabled) {
      inflightRef.current = false;
      fetchedPagesRef.current = new Set();
      commit({ items: [], meta: null, loading: false, loadingMore: false, error: null });
      return;
    }
    inflightRef.current = false;
    fetchedPagesRef.current = new Set();
    commit({ items: [], meta: null, loading: true, loadingMore: false, error: null });
    // Intentional data-fetch-on-mount/reset (same convention as useMyCoupons).
    void (async () => {
      const generation = generationRef.current;
      try {
        const page = await fetchPageRef.current(1, limit);
        if (generation !== generationRef.current) return;
        fetchedPagesRef.current.add(1);
        commit({ items: page.items, meta: page.meta, loading: false, loadingMore: false, error: null });
      } catch (error: unknown) {
        if (generation !== generationRef.current) return;
        const message = error instanceof Error ? error.message : null;
        commit({ items: [], meta: null, loading: false, loadingMore: false, error: message ?? "Request failed" });
      } finally {
        if (generation === generationRef.current) inflightRef.current = false;
      }
    })(); // eslint-disable-line react-hooks/set-state-in-effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, resetKey, commit]);

  return {
    items: state.items,
    meta: state.meta,
    loading: state.loading,
    loadingMore: state.loadingMore,
    error: state.error,
    canLoadMore: enabled && Boolean(state.meta?.has_more_pages) && !state.error,
    loadMore,
    reload,
  };
}

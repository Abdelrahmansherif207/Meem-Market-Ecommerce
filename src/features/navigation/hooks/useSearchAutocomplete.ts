"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { productService } from "@/features/products/services/productService";
import type { ProductSearchResult } from "@/features/products/types";

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;

interface State {
  results: ProductSearchResult[];
  isLoading: boolean;
  error: string | null;
}

type Action =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; results: ProductSearchResult[] }
  | { type: "FETCH_ERROR"; error: string }
  | { type: "CLEAR" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, isLoading: true, error: null };
    case "FETCH_SUCCESS":
      return { results: action.results, isLoading: false, error: null };
    case "FETCH_ERROR":
      return { results: [], isLoading: false, error: action.error };
    case "CLEAR":
      return { results: [], isLoading: false, error: null };
  }
}

export function useSearchAutocomplete() {
  const [query, setQuery] = useReducer(
    (_prev: string, next: string) => next,
    "",
  );
  const [{ results, isLoading, error }, dispatch] = useReducer(reducer, {
    results: [],
    isLoading: false,
    error: null,
  });
  const [isOpen, setIsOpen] = useReducer(
    (_prev: boolean, next: boolean) => next,
    false,
  );
  const debouncedQuery = useDebounce(query, DEBOUNCE_MS);
  const abortRef = useRef<AbortController | null>(null);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (debouncedQuery.length < MIN_QUERY_LENGTH) {
      dispatch({ type: "CLEAR" });
      setIsOpen(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    dispatch({ type: "FETCH_START" });

    productService
      .searchProducts(debouncedQuery)
      .then((data) => {
        if (!controller.signal.aborted) {
          dispatch({ type: "FETCH_SUCCESS", results: data });
          setIsOpen(true);
        }
      })
      .catch((err: Error) => {
        if (!controller.signal.aborted) {
          dispatch({ type: "FETCH_ERROR", error: err.message });
        }
      });

    return () => controller.abort();
  }, [debouncedQuery]);

  const clear = useCallback(() => {
    setQuery("");
    dispatch({ type: "CLEAR" });
    setIsOpen(false);
  }, []);

  return {
    query,
    setQuery,
    results,
    isLoading,
    isOpen,
    open,
    close,
    error,
    clear,
  };
}

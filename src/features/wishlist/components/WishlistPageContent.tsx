"use client";

import { useCallback, useEffect, useReducer } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AlertTriangle, Loader2, RefreshCw, ShoppingBag } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useAuthModalStore } from "@/features/auth/store/useAuthModalStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import EmptyState from "@/components/ui/EmptyState";
import RetryButton from "@/components/ui/RetryButton";
import { wishlistService } from "../services/wishlistService";
import { useWishlistStore } from "../store/useWishlistStore";
import { WishlistItemCard } from "./WishlistItemCard";
import { WishlistGridSkeleton } from "./WishlistGridSkeleton";
import { WishlistPagination } from "./WishlistPagination";
import type { WishlistItem, WishlistMeta } from "../types";

type Source = "signin" | "loading" | "error" | "ready";

type WishlistState = {
  source: Source;
  items: WishlistItem[];
  meta: WishlistMeta | null;
  currentPage: number;
  loadError: string | null;
  removingIds: Set<number>;
  removeError: string | null;
  lastFailedRemove: WishlistItem | null;
};

type WishlistAction =
  | { type: "SET_SIGNIN" }
  | { type: "SET_LOADING" }
  | { type: "SET_ERROR"; message: string }
  | { type: "SET_PAGE"; page: number }
  | { type: "SET_READY"; items: WishlistItem[]; meta: WishlistMeta | null }
  | { type: "REMOVE_OPTIMISTIC"; itemId: number }
  | { type: "ROLLBACK_REMOVE"; items: WishlistItem[] }
  | { type: "MARK_REMOVING"; itemId: number }
  | { type: "DONE_REMOVING"; itemId: number }
  | { type: "SET_REMOVE_ERROR"; message: string; item: WishlistItem }
  | { type: "CLEAR_REMOVE_ERROR" };

function wishlistReducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case "SET_SIGNIN":
      return { ...state, source: "signin", items: [], meta: null, loadError: null };
    case "SET_LOADING":
      return { ...state, source: "loading", loadError: null };
    case "SET_ERROR":
      return { ...state, source: "error", loadError: action.message };
    case "SET_PAGE":
      return { ...state, currentPage: action.page, source: "loading", loadError: null };
    case "SET_READY":
      return {
        ...state,
        source: "ready",
        items: action.items,
        meta: action.meta,
        loadError: null,
      };
    case "REMOVE_OPTIMISTIC":
      return {
        ...state,
        items: state.items.filter((i) => i.id !== action.itemId),
      };
    case "ROLLBACK_REMOVE":
      return { ...state, items: action.items };
    case "MARK_REMOVING": {
      const next = new Set(state.removingIds);
      next.add(action.itemId);
      return { ...state, removingIds: next };
    }
    case "DONE_REMOVING": {
      const next = new Set(state.removingIds);
      next.delete(action.itemId);
      return { ...state, removingIds: next };
    }
    case "SET_REMOVE_ERROR":
      return {
        ...state,
        removeError: action.message,
        lastFailedRemove: action.item,
      };
    case "CLEAR_REMOVE_ERROR":
      return { ...state, removeError: null, lastFailedRemove: null };
    default:
      return state;
  }
}

export function WishlistPageContent() {
  const t = useTranslations("wishlist");
  const locale = useLocale();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const openAuth = useAuthModalStore((s) => s.open);

  const [state, dispatch] = useReducer(wishlistReducer, {
    source: isAuthenticated ? "loading" : "signin",
    items: [],
    meta: null,
    currentPage: 1,
    loadError: null,
    removingIds: new Set<number>(),
    removeError: null,
    lastFailedRemove: null,
  });

  const loadPage = useCallback(
    async (page: number) => {
      dispatch({ type: "SET_LOADING" });
      try {
        const res = await wishlistService.getWishlists(locale, page);
        if (res.data.length === 0 && page > 1) {
          // The last item on a later page was removed — fall back to page 1.
          dispatch({ type: "SET_PAGE", page: 1 });
          return;
        }
        dispatch({ type: "SET_READY", items: res.data, meta: res.meta ?? null });
        useWishlistStore
          .getState()
          .setCount(res.meta?.total ?? res.data.length);
      } catch (err) {
        if (wishlistService.isUnauthorizedError(err)) {
          useAuthStore.getState().clearAuth();
          openAuth();
          return;
        }
        dispatch({
          type: "SET_ERROR",
          message: err instanceof Error ? err.message : t("loadError"),
        });
      }
    },
    [locale, t, openAuth],
  );

  // Load on mount, auth transitions and page changes.
  useEffect(() => {
    if (!isAuthenticated) {
      dispatch({ type: "SET_SIGNIN" });
      return;
    }
    loadPage(state.currentPage);
  }, [isAuthenticated, state.currentPage, loadPage]);

  const handlePageChange = useCallback((page: number) => {
    dispatch({ type: "SET_PAGE", page });
  }, []);

  const handleRetryLoad = useCallback(() => {
    loadPage(state.currentPage);
  }, [loadPage, state.currentPage]);

  const handleRemove = useCallback(
    async (item: WishlistItem) => {
      if (state.removingIds.has(item.id)) return;

      const snapshot = state.items;
      dispatch({ type: "MARK_REMOVING", itemId: item.id });
      dispatch({ type: "CLEAR_REMOVE_ERROR" });

      try {
        await wishlistService.remove(
          item.product_id,
          item.product_variant_id ?? null,
          locale,
        );
        dispatch({ type: "REMOVE_OPTIMISTIC", itemId: item.id });
        useWishlistStore.getState().setEntry(item.product_id, false);
        useWishlistStore.getState().adjustCount(-1);
      } catch (err) {
        if (wishlistService.isUnauthorizedError(err)) {
          dispatch({ type: "ROLLBACK_REMOVE", items: snapshot });
          useAuthStore.getState().clearAuth();
          openAuth();
          return;
        }
        if (wishlistService.isNotFoundError(err)) {
          // Item no longer present — refresh the list.
          dispatch({ type: "ROLLBACK_REMOVE", items: snapshot });
          loadPage(state.currentPage);
          return;
        }
        dispatch({ type: "ROLLBACK_REMOVE", items: snapshot });
        dispatch({
          type: "SET_REMOVE_ERROR",
          message: err instanceof Error ? err.message : t("removeError"),
          item,
        });
      } finally {
        dispatch({ type: "DONE_REMOVING", itemId: item.id });
      }
    },
    [state.items, state.removingIds, state.currentPage, locale, t, loadPage, openAuth],
  );

  const handleRetryRemove = useCallback(() => {
    if (state.lastFailedRemove) handleRemove(state.lastFailedRemove);
  }, [state.lastFailedRemove, handleRemove]);

  if (state.source === "signin") {
    return (
      <EmptyState
        variant="default"
        title={t("signInTitle")}
        description={t("signInDescription")}
        actions={
          <button
            type="button"
            onClick={openAuth}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white shadow-sm shadow-primary/40 transition-all hover:bg-primary-dark hover:shadow-md"
          >
            {t("signIn")}
          </button>
        }
      />
    );
  }

  if (state.source === "loading") {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex h-8 items-center">
          <Loader2 className="size-5 animate-spin text-primary" />
        </div>
        <WishlistGridSkeleton />
      </div>
    );
  }

  if (state.source === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertTriangle className="mb-3 size-10 text-red-400" />
        <p className="text-sm text-gray-500">{state.loadError}</p>
        <RetryButton
          label={t("retry")}
          onClick={handleRetryLoad}
          className="mt-4"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {state.removeError && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-red-700">
            <AlertTriangle className="size-4 shrink-0" />
            <span>{state.removeError}</span>
          </div>
          <button
            type="button"
            onClick={handleRetryRemove}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700"
          >
            <RefreshCw className="size-3" />
            {t("retry")}
          </button>
        </div>
      )}

      {state.items.length === 0 ? (
        <EmptyState
          variant="cart"
          title={t("emptyTitle")}
          description={t("emptyDescription")}
          actions={
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white shadow-sm shadow-primary/40 transition-all hover:bg-primary-dark hover:shadow-md"
            >
              <ShoppingBag className="size-4" />
              {t("browseProducts")}
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {state.items.map((item) => (
              <div
                key={item.id}
                className={
                  state.removingIds.has(item.id)
                    ? "transition-opacity duration-300 opacity-40"
                    : "transition-opacity duration-300"
                }
              >
                <WishlistItemCard
                  item={item}
                  isPending={state.removingIds.has(item.id)}
                  onRemove={() => handleRemove(item)}
                />
              </div>
            ))}
          </div>

          <WishlistPagination
            currentPage={state.meta?.current_page ?? state.currentPage}
            lastPage={state.meta?.last_page ?? 1}
            total={state.meta?.total ?? state.items.length}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}

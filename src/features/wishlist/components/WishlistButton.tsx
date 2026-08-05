"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { Heart, Loader2 } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { useWishlistActions } from "../hooks/useWishlistActions";

interface WishlistButtonProps {
  productId: number;
  variantId?: number | null;
  /** When true and no variant is selected, tapping blocks with an inline error. */
  hasVariants?: boolean;
  /** Initial heart state from the product payload (`in_wishlist` field). */
  initialInWishlist?: boolean;
  /** Fetch the guest-safe initial state from the API (product detail page). */
  fetchInitial?: boolean;
  variant?: "icon" | "full";
  className?: string;
}

/**
 * Heart button used across product cards (icon overlay) and the product
 * detail page (full width). Handles guest auth flow, optimistic toggling,
 * variant validation and inline error/notice messages.
 */
export function WishlistButton({
  productId,
  variantId,
  hasVariants = false,
  initialInWishlist,
  fetchInitial = false,
  variant = "icon",
  className,
}: WishlistButtonProps) {
  const t = useTranslations("wishlist");
  const isFull = variant === "full";
  const { inWishlist, isPending, error, setError, toggle, add, remove } =
    useWishlistActions(productId, { variantId, initialInWishlist, fetchInitial });
  const [notice, setNotice] = useState<string | null>(null);

  const message = error ?? notice;

  const showMessage = useCallback(
    (text: string, kind: "notice" | "error") => {
      if (kind === "error") setError(text);
      else setNotice(text);
      window.setTimeout(() => {
        setError(null);
        setNotice(null);
      }, 4000);
    },
    [setError],
  );

  const handleClick = useCallback(async () => {
    if (!isFull) {
      await toggle();
      return;
    }

    if (hasVariants && !variantId && !inWishlist) {
      showMessage(t("pleaseSelectVariant"), "error");
      return;
    }

    if (inWishlist) {
      const result = await remove();
      if (result === "ok") showMessage(t("removed"), "notice");
    } else {
      const result = await add();
      if (result === "ok") showMessage(t("added"), "notice");
      else if (result === "duplicate") showMessage(t("alreadyInWishlist"), "notice");
    }
  }, [isFull, hasVariants, variantId, inWishlist, remove, add, toggle, t, showMessage]);

  if (isFull) {
    return (
      <div className={className}>
        <button
          type="button"
          onClick={handleClick}
          disabled={isPending}
          aria-pressed={inWishlist}
          className={cn(
            "flex w-full items-center justify-center gap-3 rounded-xl border px-6 py-3 text-sm font-semibold transition",
            inWishlist
              ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
              : "border-border bg-white text-text-primary hover:bg-surface",
            isPending && "cursor-not-allowed opacity-70",
          )}
        >
          {isPending ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Heart
              className={cn("size-5", inWishlist && "fill-red-500 text-red-500")}
            />
          )}
          {inWishlist ? t("inWishlist") : t("addToWishlist")}
        </button>

        {message && (
          <p
            className={cn(
              "mt-2 text-center text-xs",
              error ? "text-red-500" : "text-amber-600",
            )}
          >
            {message}
          </p>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={inWishlist}
      aria-label={inWishlist ? t("inWishlist") : t("addToWishlist")}
      className={cn(
        "absolute top-2 end-2 z-20 flex size-8 items-center justify-center rounded-full bg-white/85 shadow-sm backdrop-blur-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    >
      <Heart
        className={cn(
          "size-4 transition-colors",
          inWishlist ? "fill-red-500 text-red-500" : "text-gray-600",
          isPending && "opacity-60",
        )}
      />
    </button>
  );
}

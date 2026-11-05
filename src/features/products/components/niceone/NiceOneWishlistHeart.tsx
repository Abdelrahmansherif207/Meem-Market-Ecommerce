"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { Heart, Loader2 } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { useWishlistActions } from "@/features/wishlist/hooks/useWishlistActions";
import type { ProductDetail, ProductVariant } from "../../types";

interface NiceOneWishlistHeartProps {
  product: ProductDetail;
  selectedVariant: ProductVariant | null;
}

/**
 * Circle heart button from the Stitch PDP screens (top row of the info
 * panel). New presentation; the behavior is the exact same wishlisting
 * flow as the existing detail-page button: guest auth modal, optimistic
 * toggle, and the "select a variant first" guard for variant products.
 * Logic itself is untouched (`useWishlistActions`).
 */
export function NiceOneWishlistHeart({ product, selectedVariant }: NiceOneWishlistHeartProps) {
  const t = useTranslations("wishlist");
  const hasVariants = product.variants.length > 0;
  const variantId = selectedVariant?.id ?? null;
  const { inWishlist, isPending, error, setError, add, remove } = useWishlistActions(
    product.id,
    { variantId, fetchInitial: true },
  );
  const [notice, setNotice] = useState<string | null>(null);

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
  }, [hasVariants, variantId, inWishlist, remove, add, t, showMessage]);

  return (
    <div className="flex flex-col items-end">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-pressed={inWishlist}
        aria-label={inWishlist ? t("inWishlist") : t("addToWishlist")}
        className={cn(
          "flex size-10 items-center justify-center rounded-full border bg-white text-text-secondary transition",
          inWishlist ? "border-error/40 text-error" : "border-line hover:border-discount/50 hover:text-discount",
          isPending && "cursor-not-allowed opacity-70",
        )}
      >
        {isPending ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <Heart className={cn("size-5", inWishlist && "fill-discount text-error")} />
        )}
      </button>

      {(error || notice) && (
        <p
          className={cn(
            "mt-1 text-end text-[10px] leading-tight",
            error ? "text-error" : "text-amber-600",
          )}
        >
          {error ?? notice}
        </p>
      )}
    </div>
  );
}

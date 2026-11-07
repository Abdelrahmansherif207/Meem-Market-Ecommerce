"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ShoppingBag } from "lucide-react";
import { useCartActions } from "@/features/cart/hooks/useCartActions";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Button } from "@/components/ui/Button";
import { useDisplayCurrency } from "@/features/currencies";
import { formatNumber } from "@/shared/utils/formatMoney";
import Skeleton from "@/components/ui/Skeleton";
import type { ProductDetail, ProductVariant } from "../../types";
import { getDisplayPrice, getStockStatus } from "../../utils";

interface NiceOneBuyBoxProps {
  product: ProductDetail;
  selectedVariant: ProductVariant | null;
  /** When true, the total price renders as a skeleton bar. */
  pricesLoading?: boolean;
}

/**
 * Primary add-to-cart block (Stitch PDP screens): solid ink "Add To Bag"
 * button, which converts into the shared pill quantity stepper once the
 * item is in the cart — same behavior as the existing `ProductActions`.
 *
 * The cart payload is a byte-for-byte port of `ProductActions`'s call so
 * cart/wishlist logic and hooks remain untouched. Per the screens the
 * initial add quantity is 1 (multi-quantity is handled afterwards via the
 * stepper, exactly like the product cards).
 */
export function NiceOneBuyBox({ product, selectedVariant, pricesLoading = false }: NiceOneBuyBoxProps) {
  const t = useTranslations("product");
  const tPdp = useTranslations("niceOnePdp");
  const locale = useLocale();
  const { symbol: currencySymbol, decimalPlaces } = useDisplayCurrency(product.currency);

  const stock = selectedVariant
    ? { inStock: product.in_stock && selectedVariant.quantity > 0, remaining: selectedVariant.quantity }
    : getStockStatus(product);
  const maxQuantity = Math.min(stock.remaining, 99);
  /** Fixed initial add quantity (design decision — see section-mapping doc). */
  const [addQuantity] = useState(1);

  const { addItem, increment, decrement, quantity: cartQuantity, isPending } = useCartActions(product.id);

  const price = selectedVariant ? selectedVariant.current_price : getDisplayPrice(product);
  const productImage = product.images?.thumbnail ?? "";

  async function handleAddToCart() {
    await addItem({
      quantity: addQuantity,
      product_variant_id: selectedVariant?.id ?? null,
      name: product.name,
      image: productImage,
      price,
      current_price: price,
      slug: product.slug,
      sku: product.sku,
      in_stock: stock.inStock,
      stock_quantity: stock.remaining,
    });
  }

  return (
    <div className="space-y-3">
      {cartQuantity > 0 ? (
        <QuantityStepper
          value={cartQuantity}
          onIncrement={() => increment()}
          onDecrement={() => decrement()}
          decrementAsRemove
          incrementDisabled={!stock.inStock || cartQuantity >= maxQuantity}
          disabled={isPending}
          variant="pill"
          alwaysExpanded
          incrementLabel={t("increaseQuantity")}
          decrementLabel={t("decreaseQuantity")}
          removeLabel={t("removeItem")}
        />
      ) : (
        <Button
          full
          size="lg"
          variant="secondary"
          loading={isPending}
          disabled={!stock.inStock}
          onClick={handleAddToCart}
        >
          {!isPending && <ShoppingBag className="size-5" aria-hidden />}
          {stock.inStock ? (
            <span className="uppercase tracking-wide">{tPdp("addToBag")}</span>
          ) : (
            t("outOfStock")
          )}
        </Button>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-text-secondary">
        <span>
          {t("sku")}: {product.sku}
        </span>
        {pricesLoading ? (
          <Skeleton className="h-3 w-20" />
        ) : (
          <>
            <span className="font-semibold text-text-primary">
              {formatNumber(price * Math.max(cartQuantity, 1), locale, decimalPlaces)} {currencySymbol}
            </span>
            <span className={stock.inStock ? "text-success" : "text-error"}>
              {stock.inStock ? t("inStock", { count: stock.remaining }) : t("outOfStock")}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import { useLocale, useTranslations } from "next-intl";
import { Loader2, ShoppingBag } from "lucide-react";
import { useCartActions } from "@/features/cart/hooks/useCartActions";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { useDisplayCurrency } from "@/features/currencies";
import { formatNumber } from "@/shared/utils/formatMoney";
import Skeleton from "@/components/ui/Skeleton";
import type { ProductDetail, ProductVariant } from "../../types";
import { getDisplayPrice, getStockStatus } from "../../utils";

interface NiceOneStickyBarProps {
  product: ProductDetail;
  selectedVariant: ProductVariant | null;
  /** While the currency refetch is in flight, price numbers skeleton. */
  pricesLoading?: boolean;
}

/**
 * Mobile fixed bottom bar from the Stitch PDP screen (390px): "Total
 * Price" + solid ink ADD TO BAG. Once the item is in the cart the right
 * side becomes the shared pill stepper — same behavior as the existing
 * actions. Sits directly above the app's fixed `MobileBottomNav` and is
 * desktop-hidden.
 *
 * Cart payload is the same shape as `ProductActions` (variant-aware) so
 * the cart logic stays untouched.
 */
export function NiceOneStickyBar({ product, selectedVariant, pricesLoading = false }: NiceOneStickyBarProps) {
  const t = useTranslations("niceOnePdp");
  const tProduct = useTranslations("product");
  const locale = useLocale();
  const { symbol: currencySymbol, decimalPlaces } = useDisplayCurrency(product.currency);
  const formatPrice = (v: number) => formatNumber(v, locale, decimalPlaces);

  const stock = selectedVariant
    ? { inStock: product.in_stock && selectedVariant.quantity > 0, remaining: selectedVariant.quantity }
    : getStockStatus(product);
  const maxQuantity = Math.min(stock.remaining, 99);

  const { addItem, increment, decrement, quantity: cartQuantity, isPending } = useCartActions(product.id);

  const price = selectedVariant ? selectedVariant.current_price : getDisplayPrice(product);
  const productImage = product.images?.thumbnail ?? "";
  const variant = selectedVariant;

  async function handleAddToCart() {
    await addItem({
      quantity: 1,
      product_variant_id: variant?.id ?? null,
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
    <div className="fixed inset-x-0 bottom-14 z-40 flex items-center gap-3 border-t border-line bg-white/95 px-4 py-3 shadow-elev-2 backdrop-blur lg:hidden">
      <div className="flex flex-col">
        <span className="text-[10px] leading-none text-text-muted">{t("totalPrice")}</span>
        {pricesLoading ? (
          <Skeleton className="mt-1 h-6 w-24" />
        ) : (
          <div className="mt-0.5 flex items-baseline gap-1" dir="ltr">
            <span className="text-lg font-extrabold leading-none text-discount">
              {formatPrice(price)}
            </span>
            <span className="text-xs font-bold text-text-primary">{currencySymbol}</span>
          </div>
        )}
      </div>

      {cartQuantity > 0 ? (
        <QuantityStepper
          className="flex-1 justify-center"
          value={cartQuantity}
          onIncrement={() => increment()}
          onDecrement={() => decrement()}
          decrementAsRemove
          incrementDisabled={!stock.inStock || cartQuantity >= maxQuantity}
          disabled={isPending}
          variant="pill"
          alwaysExpanded
          incrementLabel={tProduct("increaseQuantity")}
          decrementLabel={tProduct("decreaseQuantity")}
          removeLabel={tProduct("removeItem")}
        />
      ) : (
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!stock.inStock || isPending}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-secondary py-3.5 text-xs font-bold tracking-wide text-text-primary shadow-elev-1 transition-colors hover:bg-secondary-dark hover:text-white active:bg-secondary-dark active:text-white disabled:pointer-events-none disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <ShoppingBag className="size-4" aria-hidden />
          )}
          {stock.inStock ? (
            <span className="uppercase">{t("addToBag")}</span>
          ) : (
            tProduct("outOfStock")
          )}
        </button>
      )}
    </div>
  );
}

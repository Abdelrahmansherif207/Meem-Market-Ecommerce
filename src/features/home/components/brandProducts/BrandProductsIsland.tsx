"use client";

import { useCallback, type ReactNode } from "react";
import SectionTitle from "@/components/ui/SectionTitle";
import ProductSlider from "../../productSlider/ProductSlider";
import { useCurrencyRefetch } from "@/features/currencies";
import {
  getBrandProductBlocksAction,
  type BrandProductBlock,
} from "../../actions/homeCurrencyActions";
import type { ProductItem } from "../../types";

interface BrandProductsIslandProps {
  fetchKind: "banners" | "brands";
  endpoint: string;
  locale: string;
  title?: string;
  columnsCount?: number;
  initialBlocks: { id: number; name: string; banner: ReactNode }[];
  initialItemsByBrand: Record<number, ProductItem[]>;
}

/**
 * Client island owning currency-driven refetches for brand-product
 * blocks. Static brand banners arrive as pre-rendered nodes (async Server
 * Components can't render inside client code); only the product sliders
 * below them refetch, with the picker's code as an explicit Server Action
 * argument.
 */
export default function BrandProductsIsland({
  fetchKind,
  endpoint,
  locale,
  title,
  columnsCount,
  initialBlocks,
  initialItemsByBrand,
}: BrandProductsIslandProps) {
  const fetchAction = useCallback(
    (currency: string) =>
      getBrandProductBlocksAction(endpoint, fetchKind, locale, currency),
    [endpoint, fetchKind, locale],
  );
  const firstItems = Object.values(initialItemsByBrand)[0];
  const { data: blocks, isRefreshing } = useCurrencyRefetch<BrandProductBlock[]>(
    fetchAction,
    initialBlocks.map((b) => ({
      id: b.id,
      name: b.name,
      items: initialItemsByBrand[b.id] ?? [],
    })),
    firstItems?.[0]?.currency?.code,
  );
  const bannersById = new Map(initialBlocks.map((b) => [b.id, b.banner]));

  return (
    <div className="flex flex-col pb-4 overflow-hidden">
      {title && <SectionTitle title={title} />}
      <div className="flex flex-col gap-y-12">
        {blocks.map((block) => (
          <div key={block.id} className="flex flex-col gap-y-4">
            {bannersById.get(block.id)}
            {block.items.length > 0 && (
              <ProductSlider
                title={block.name}
                items={block.items}
                columnsCount={columnsCount}
                pricesLoading={isRefreshing}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

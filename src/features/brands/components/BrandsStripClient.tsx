"use client";

import SectionTitle from "@/components/ui/SectionTitle";
import { gridColumnsClass } from "@/shared/utils/gridClasses";
import BrandCard from "./BrandCard";
import type { Brand } from "../types";

interface BrandsStripClientProps {
  brands: Brand[];
  title?: string;
  /** Admin front setting `columns_count`. */
  columnsCount?: number;
}

export default function BrandsStripClient({ brands, title, columnsCount }: BrandsStripClientProps) {
  const limit = Math.max(1, Math.min(8, Math.round(columnsCount ?? 8)));

  return (
    <section className="group relative w-full pb-4">
      {title ? <SectionTitle title={title} /> : null}
      <div
        className={`grid gap-4 ${gridColumnsClass(limit, "two")}`}
      >
        {brands.slice(0, limit).map((brand) => (
          <BrandCard key={brand.id} brand={brand} />
        ))}
      </div>
    </section>
  );
}

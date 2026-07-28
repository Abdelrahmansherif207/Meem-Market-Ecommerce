"use client";

import SectionTitle from "@/components/ui/SectionTitle";
import BrandCard from "./BrandCard";
import type { Brand } from "../types";

interface BrandsStripClientProps {
  brands: Brand[];
  title?: string;
}

export default function BrandsStripClient({ brands, title }: BrandsStripClientProps) {
  return (
    <section className="group relative w-full pb-4">
      {title ? <SectionTitle title={title} /> : null}
      <div className="grid grid-cols-2 sm:grid-cols-4">
        {brands.slice(0, 8).map((brand) => (
          <BrandCard key={brand.id} brand={brand} />
        ))}
      </div>
    </section>
  );
}

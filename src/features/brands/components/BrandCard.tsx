"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/shared/utils/cn";
import type { Brand } from "../types";

interface BrandCardProps {
  brand: Brand;
  priority?: boolean;
}

export default function BrandCard({ brand, priority }: BrandCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      href={`/brands/${brand.slug}`}
      className="group flex flex-col items-center transition-colors border border-black/10 rounded-md"
    >
      <div className="flex items-center justify-center overflow-hidden w-full aspect-square max-w-[150px]">
        {imgError ? (
          <span className="text-3xl font-bold text-text-secondary">
            {brand.name.charAt(0)}
          </span>
        ) : (
          <img
            src={brand.image.desktop || brand.image.mobile}
            alt={brand.name}
            className="h-auto w-full object-contain"
            loading={priority ? "eager" : "lazy"}
            onError={() => setImgError(true)}
          />
        )}
      </div>
    </Link>
  );
}

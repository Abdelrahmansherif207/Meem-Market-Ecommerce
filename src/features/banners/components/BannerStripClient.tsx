"use client";

import SectionTitle from "@/components/ui/SectionTitle";
import type { Banner } from "../types";

interface BannerStripClientProps {
  banners: Banner[];
  title?: string;
  locale: string;
}

export default function BannerStripClient({ banners, title, locale }: BannerStripClientProps) {
  if (!banners.length) return null;

  return (
    <section className="w-full" aria-label="Banner strip">
      {title && <SectionTitle title={title} />}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {banners.map((banner) => (
          <a
            key={banner.id}
            href={`/${locale}/banners/${banner.slug}`}
            className="relative block w-full overflow-hidden rounded-xl aspect-[16/9] sm:aspect-[4/3] group"
          >
            <picture className="absolute inset-0">
              <source media="(min-width: 640px)" srcSet={banner.image.desktop} />
              <img
                src={banner.image.mobile}
                alt={banner.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' fill='%23e5e7eb'%3E%3Crect width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af' font-size='14'%3EImage unavailable%3C/text%3E%3C/svg%3E";
                }}
              />
            </picture>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <h3 className="text-white text-sm sm:text-base font-bold drop-shadow-md line-clamp-2">
                {banner.title}
              </h3>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

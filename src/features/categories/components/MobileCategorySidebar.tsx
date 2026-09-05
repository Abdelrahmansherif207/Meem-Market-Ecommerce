"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import type { SubCategory } from "../types";
import { cn } from "@/shared/utils/cn";
import { AllCategoryIcon } from "@/components/ui/icons/AllCategoryIcon";

interface MobileCategorySidebarProps {
  subCategories: SubCategory[];
  currentSlug: string;
  parentSlug: string;
}

export default function MobileCategorySidebar({
  subCategories,
  currentSlug,
  parentSlug,
}: MobileCategorySidebarProps) {
  const t = useTranslations("header.categoryNav");

  if (!subCategories || subCategories.length === 0) return null;

  const circleClasses = (isActive: boolean) =>
    cn(
      "flex h-[64px] w-[64px] items-center justify-center rounded-full border transition-all duration-200",
      isActive
        ? "border-primary bg-primary/10 shadow-elev-1 ring-2 ring-primary/25"
        : "border-border bg-gradient-to-b from-white to-surface",
    );

  const labelClasses = (isActive: boolean) =>
    cn(
      "px-0.5 text-2xs font-medium leading-tight text-center line-clamp-2 min-h-[2.5em]",
      isActive ? "text-primary" : "text-text-secondary",
    );

  const imageSrc = (image: SubCategory["image"] | undefined) =>
    image?.mobile || image?.desktop;

  return (
    <div className="h-full w-[92px] bg-surface py-4">
      <div className="flex flex-col items-center gap-4">
        <Link
          href={`/category/${parentSlug}`}
          className="flex w-full flex-col items-center gap-1.5 px-1"
        >
          <div className={circleClasses(currentSlug === parentSlug)}>
            <AllCategoryIcon
              className={cn(
                "h-[28px] w-[28px] rounded-full stroke-2 transition-colors",
                currentSlug === parentSlug
                  ? "text-primary"
                  : "text-text-muted",
              )}
            />
          </div>
          <span className={labelClasses(currentSlug === parentSlug)}>
            {t("all")}
          </span>
        </Link>

        {subCategories.map((subcat) => {
          const isActive = currentSlug === subcat.slug;
          const src = imageSrc(subcat.image);
          return (
            <Link
              key={subcat.id}
              href={`/category/${subcat.slug}`}
              className="flex w-full flex-col items-center gap-1.5 px-1"
            >
              <div className={circleClasses(isActive)}>
                {src && (
                  <div className="flex h-[48px] w-[48px] items-center justify-center overflow-hidden rounded-full bg-white">
                    <Image
                      src={src}
                      alt={subcat.name}
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </div>
                )}
              </div>
              <span className={labelClasses(isActive)}>
                {subcat.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
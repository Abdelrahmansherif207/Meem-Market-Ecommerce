"use client";

import { useTranslations, useLocale } from "next-intl";
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
  const locale = useLocale();

  if (!subCategories || subCategories.length === 0) return null;

  return (
    <div className="w-[85px] bg-[#f4f5f7] py-4 h-full">
      <div className="flex flex-col items-center gap-6 h-full justify-start">
        <Link
          href={`/category/${parentSlug}`}
          className="flex flex-col items-center gap-2 px-1 w-full"
        >
          <div
            className={cn(
              "w-[56px] h-[56px] rounded-full flex justify-center items-center transition-colors shadow-sm",
              currentSlug === parentSlug
                ? "bg-white border-2 border-primary"
                : "bg-white border border-transparent",
            )}
          >
            <AllCategoryIcon
              className={cn(
                "rounded-full stroke-2 transition-colors",
                currentSlug === parentSlug
                  ? "text-primary"
                  : "text-foreground"
              )}
            />
          </div>
          <span 
            className={cn(
              "text-[11px] leading-tight font-medium text-center",
              currentSlug === parentSlug ? "text-primary" : "text-foreground",
            )}
          >
            {t("all")}
          </span>
        </Link>

        {subCategories.map((subcat) => {
          const isActive = currentSlug === subcat.slug;
          return (
            <Link
              key={subcat.id}
              href={`/category/${subcat.slug}`}
              className="flex flex-col items-center gap-2 px-1 w-full"
            >
              <div
                className={cn(
                  "w-[56px] h-[56px] rounded-full overflow-hidden flex items-end justify-center p-1 transition-colors shadow-sm",
                  isActive
                    ? "bg-white border-2 border-primary"
                    : "bg-white border border-transparent",
                )}
              >
                <div className="relative rounded-full overflow-hidden w-full h-full flex items-end justify-center">
                  {subcat.image?.mobile || subcat.image?.desktop ? (
                    <Image
                      src={subcat.image.mobile || subcat.image.desktop}
                      alt={subcat.name}
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  ) : null}
                </div>
              </div>
              <span
                className={cn(
                  "text-[11px] leading-tight font-medium text-center line-clamp-3",
                  isActive ? "text-primary" : "text-foreground",
                )}
              >
                {subcat.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

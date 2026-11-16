import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { CategoryMenuItem } from "../types";

type CategoryGridCardProps = {
  subcategory: CategoryMenuItem;
};

/**
 * Grid card for the categories page (mobile + desktop), matching the
 * homepage "Shop by Category" card style: white card shell, tinted
 * rounded panel, artwork inside a circle, white name area below.
 * Base classes preserve the compact mobile tiles; `sm:` scales them up.
 */
export default function CategoryGridCard({
  subcategory,
}: CategoryGridCardProps) {
  const imageSrc = subcategory.image?.mobile || subcategory.image?.desktop;

  return (
    <Link
      href={`/category/${subcategory.slug}`}
      className="group flex flex-col items-center gap-1.5 rounded-2xl border border-meem-border-soft bg-white p-2 shadow-elev-1 transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-elev-2 sm:gap-2 sm:p-2.5"
    >
      <div className="w-full rounded-xl bg-meem-tint p-[7px] sm:p-2">
        <div className="relative aspect-square w-full overflow-hidden rounded-full bg-white">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={subcategory.name}
              fill
              sizes="(min-width: 1024px) 112px, (min-width: 640px) 96px, 64px"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="h-full w-full bg-border-light/60" />
          )}
        </div>
      </div>
      <span className="text-center text-[11px] font-semibold leading-snug line-clamp-2 text-meem-charcoal sm:text-xs">
        {subcategory.name}
      </span>
    </Link>
  );
}

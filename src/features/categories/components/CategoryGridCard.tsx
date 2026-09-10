import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { CategoryMenuItem } from "../types";

type CategoryGridCardProps = {
  subcategory: CategoryMenuItem;
};

/**
 * Compact grid card for the categories page (mobile + desktop):
 * light rounded tile, contained image, centered name below.
 * Base classes preserve the mobile appearance; `sm:` overrides
 * scale the tile up on larger screens.
 */
export default function CategoryGridCard({
  subcategory,
}: CategoryGridCardProps) {
  const imageSrc = subcategory.image?.mobile || subcategory.image?.desktop;

  return (
    <Link
      href={`/category/${subcategory.slug}`}
      className="flex flex-col items-center gap-1.5 rounded-xl bg-gradient-to-b from-primary/10 to-white p-2 pt-3 transition-shadow active:shadow-sm hover:shadow-md sm:gap-2 sm:p-3 sm:pt-4"
    >
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={subcategory.name}
          width={80}
          height={80}
          sizes="(min-width: 640px) 80px, 64px"
          className="h-16 w-16 object-contain sm:h-20 sm:w-20"
        />
      ) : (
        <div className="h-16 w-16 rounded-lg bg-border-light/60 sm:h-20 sm:w-20" />
      )}
      <span className="text-center text-[11px] font-semibold leading-snug line-clamp-2 sm:text-xs">
        {subcategory.name}
      </span>
    </Link>
  );
}

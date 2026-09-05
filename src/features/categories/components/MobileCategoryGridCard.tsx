import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { CategoryMenuItem } from "../types";

type MobileCategoryGridCardProps = {
  subcategory: CategoryMenuItem;
};

/**
 * Compact 4-per-row card for the mobile categories grid:
 * light rounded tile, contained image, centered name below.
 */
export default function MobileCategoryGridCard({
  subcategory,
}: MobileCategoryGridCardProps) {
  const imageSrc = subcategory.image?.mobile || subcategory.image?.desktop;

  return (
    <Link
      href={`/category/${subcategory.slug}`}
      className="flex flex-col items-center gap-1.5 rounded-xl bg-gradient-to-b from-primary/10 to-white p-2 pt-3 transition-shadow active:shadow-sm hover:shadow-md"
    >
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={subcategory.name}
          width={64}
          height={64}
          sizes="64px"
          className="h-16 w-16 object-contain"
        />
      ) : (
        <div className="h-16 w-16 rounded-lg bg-border-light/60" />
      )}
      <span className="text-center text-[11px] font-semibold leading-snug line-clamp-2">
        {subcategory.name}
      </span>
    </Link>
  );
}

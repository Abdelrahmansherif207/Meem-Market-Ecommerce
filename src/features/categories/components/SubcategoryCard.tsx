import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { CategoryMenuItem } from "../types";

type SubcategoryCardProps = {
  subcategory: CategoryMenuItem;
};

export default function SubcategoryCard({ subcategory }: SubcategoryCardProps) {
  const imageSrc = subcategory.image?.desktop || subcategory.image?.mobile;

  return (
    <Link
      href={`/category/${subcategory.slug}`}
      className="flex w-40 shrink-0 flex-col justify-between rounded-2xl bg-surface p-3 sm:p-4 h-48 sm:h-52 md:h-56 lg:h-64 sm:w-44 md:w-48 lg:w-56 transition-shadow hover:shadow-md"
    >
      <span className="text-xs sm:text-sm lg:text-base font-bold leading-tight line-clamp-2">
        {subcategory.name}
      </span>
      {imageSrc && (
        <div className="flex justify-center">
          <Image
            src={imageSrc}
            alt={subcategory.name}
            width={80}
            height={80}
            className="object-contain h-24 w-24 sm:h-28 sm:w-28 lg:h-40 lg:w-40"
          />
        </div>
      )}
    </Link>
  );
}

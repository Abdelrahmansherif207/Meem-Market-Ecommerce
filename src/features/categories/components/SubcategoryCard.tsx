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
      className="flex w-36 shrink-0 flex-col justify-between rounded-2xl bg-surface p-3 h-44 transition-shadow hover:shadow-md"
    >
      <span className="text-xs font-bold leading-tight line-clamp-2">
        {subcategory.name}
      </span>
      {imageSrc && (
        <div className="flex justify-center">
          <Image
            src={imageSrc}
            alt={subcategory.name}
            width={80}
            height={80}
            className="object-contain h-20 w-20"
          />
        </div>
      )}
    </Link>
  );
}

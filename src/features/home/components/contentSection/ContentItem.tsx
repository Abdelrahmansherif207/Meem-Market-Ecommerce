import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { cn } from "@/shared/utils/cn";
import type { ContentItemProps } from "../../types";

export default function ContentItem({ item, isCircle }: ContentItemProps) {
  const src = item.image.mobile || item.image.desktop;

  const hasImage = Boolean(src);

  return (
    <Link
      href={`/category/${item.slug}`}
      className="group flex flex-col items-center justify-between rounded-lg transition-all duration-300 overflow-hidden gap-2 hover:-translate-y-0.5"
    >
      <div
        className={cn(
          "relative w-full aspect-square flex items-center justify-center bg-surface transition-all duration-300 group-hover:shadow-md",
          isCircle && "rounded-full",
        )}
      >
        {hasImage && (
          <Image
            src={src}
            alt={item.name}
            width={100}
            height={100}
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 150px"
          />
        )}
      </div>
      <div className="w-full text-center flex-1 flex items-center justify-center">
        <p className="text-md font-bold line-clamp-2 leading-tight text-primary">
          {item.name}
        </p>
      </div>
    </Link>
  );
}

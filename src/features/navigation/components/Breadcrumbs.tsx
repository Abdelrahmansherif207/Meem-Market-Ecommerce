import { ChevronRight, ChevronLeft } from "lucide-react";
import Link from "next/link";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  locale?: string;
};

export default function Breadcrumbs({ items, locale }: BreadcrumbsProps) {
  if (!items?.length) return null;
  const isRtl = locale === "ar";

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center flex-wrap gap-1 text-sm text-text-secondary">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const Separator = isRtl ? ChevronLeft : ChevronRight;
          return (
            <li key={item.label + index} className="flex items-center gap-1">
              {index > 0 && (
                <Separator className="h-3.5 w-3.5 shrink-0 text-gray-400" />
              )}
              {isLast || !item.href ? (
                <span
                  className={isLast ? "font-semibold text-text-primary" : ""}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-primary-dark transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

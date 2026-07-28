import { Link } from "@/i18n/navigation";
import { cn } from "@/shared/utils/cn";
import { CaretRightIcon } from "./CaretRightIcon";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className }: BreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("py-3 text-[15px] text-text-primary", className)}
    >
      <ol className="flex flex-wrap items-center gap-3">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              key={`${item.href ?? item.label}-${index}`}
              className="flex items-center gap-3"
            >
              {index > 0 ? (
                <CaretRightIcon
                  aria-hidden="true"
                  className="h-3.5 w-2 shrink-0 stroke-1 text-gray-500 rtl:rotate-180"
                  data-testid="caret-right-icon"
                />
              ) : null}

              {isLast || !item.href ? (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={cn("font-medium", isLast && "text-text-primary")}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="font-bold text-primary transition hover:text-primary-dark"
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

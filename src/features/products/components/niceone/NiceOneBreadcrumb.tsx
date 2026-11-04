import { Link } from "@/i18n/navigation";
import { cn } from "@/shared/utils/cn";

export interface NiceOneBreadcrumbItem {
  label: string;
  href?: string;
}

interface NiceOneBreadcrumbProps {
  items: NiceOneBreadcrumbItem[];
  className?: string;
}

/**
 * Nice One-style breadcrumb trail (Stitch PDP screen): compact gray text
 * separated by slashes, horizontally scrollable on mobile, current page
 * truncated. Purely presentational — same items contract as the shared
 * `Breadcrumb` UI primitive.
 */
export default function NiceOneBreadcrumb({ items, className }: NiceOneBreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("pt-4 pb-2 text-xs text-text-muted", className)}
    >
      <ol className="no-scrollbar flex items-center gap-1.5 overflow-x-auto whitespace-nowrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              key={`${item.href ?? item.label}-${index}`}
              className="flex items-center gap-1.5"
            >
              {index > 0 && <span aria-hidden="true" className="text-text-muted/60">/</span>}

              {isLast || !item.href ? (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={cn(
                    "truncate",
                    isLast ? "max-w-[220px] font-medium text-text-secondary" : "text-text-muted",
                  )}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-text-muted transition-colors hover:text-text-primary"
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

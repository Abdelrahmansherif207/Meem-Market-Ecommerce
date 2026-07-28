"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import type { CategoryProductsResponse } from "../types";

interface PaginationProps {
  links: CategoryProductsResponse["links"];
}

export default function Pagination({ links }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createUrl = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page <= 1) {
        params.delete("page");
      } else {
        params.set("page", String(page));
      }
      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [pathname, searchParams],
  );

  const pages: (number | "...")[] = [];
  const total = links.last_page;
  const current = links.current_page;

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push("...");
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i);
    }
    if (current < total - 2) pages.push("...");
    pages.push(total);
  }

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1">
      {links.prev_page_url ? (
        <Link
          href={createUrl(current - 1)}
          className="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-surface transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span className="inline-flex items-center justify-center h-9 w-9 rounded-md text-gray-300">
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`ellipsis-${i}`} className="h-9 w-9 inline-flex items-center justify-center text-sm text-text-secondary">
            ...
          </span>
        ) : (
          <Link
            key={page}
            href={createUrl(page)}
            className={cn(
              "inline-flex items-center justify-center h-9 min-w-9 rounded-md text-sm font-medium transition-colors hover:bg-surface",
              page === current
                ? "bg-primary text-white hover:bg-primary-dark"
                : "text-text-primary",
            )}
            aria-current={page === current ? "page" : undefined}
          >
            {page}
          </Link>
        ),
      )}

      {links.next_page_url ? (
        <Link
          href={createUrl(current + 1)}
          className="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-surface transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className="inline-flex items-center justify-center h-9 w-9 rounded-md text-gray-300">
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}

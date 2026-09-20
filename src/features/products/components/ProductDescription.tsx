"use client";

import { useMemo } from "react";
import { cn } from "@/shared/utils/cn";
import {
  resolveProductDescriptionHtml,
  sanitizeProductHtml,
} from "../utils";

interface ProductDescriptionProps {
  description: string | Record<string, string> | null | undefined;
  locale?: string;
  className?: string;
}

/**
 * Renders backend-provided product HTML (lists, paragraphs, bold, ...)
 * as final formatted content instead of raw markup.
 */
export function ProductDescription({ description, locale, className }: ProductDescriptionProps) {
  const html = useMemo(() => {
    const resolved = resolveProductDescriptionHtml(description, locale);
    return sanitizeProductHtml(resolved);
  }, [description, locale]);

  if (!html) return null;

  return (
    <div
      dir="auto"
      className={cn(
        "text-sm leading-relaxed text-text-secondary",
        // Rich-text elements coming from the backend HTML.
        "[&_p]:mb-2 [&_p:last-child]:mb-0",
        "[&_ul]:mb-2 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:ps-5 [&_ul:last-child]:mb-0",
        "[&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:ps-5 [&_ol:last-child]:mb-0",
        "[&_li]:leading-relaxed",
        "[&_strong]:font-semibold [&_strong]:text-text-primary",
        "[&_b]:font-semibold [&_b]:text-text-primary",
        "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2",
        "[&_h1]:mb-2 [&_h1]:text-base [&_h1]:font-bold [&_h1]:text-text-primary",
        "[&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-text-primary",
        "[&_h3]:mb-2 [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-text-primary",
        "[&_h4]:mb-2 [&_h4]:text-sm [&_h4]:font-bold [&_h4]:text-text-primary",
        "[&_table]:w-full [&_table]:text-sm",
        "[&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1",
        "[&_th]:border [&_th]:border-border [&_th]:bg-surface [&_th]:px-2 [&_th]:py-1 [&_th]:text-start",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

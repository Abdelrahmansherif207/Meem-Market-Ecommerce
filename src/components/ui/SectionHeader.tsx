import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/shared/utils/cn";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  /** Extra classes for the subtitle (e.g. hide it on mobile). */
  subtitleClassName?: string;
  /** Custom right-hand content (e.g. a countdown). Takes precedence over the link. */
  action?: ReactNode;
  /** Locale-aware "View all" link. Rendered only when `action` is absent. */
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

/**
 * Shared homepage section heading: tight display title on the start side,
 * optional supporting text, and a single action on the end side. Purely
 * presentational — pages decide the destination and label.
 */
export function SectionHeader({
  title,
  subtitle,
  subtitleClassName,
  action,
  actionLabel,
  actionHref,
  className,
}: SectionHeaderProps) {
  const actionNode =
    action ??
    (actionLabel && actionHref ? (
      <Link
        href={actionHref}
        className="whitespace-nowrap text-xs font-semibold text-catch-muted underline decoration-catch-rose decoration-2 underline-offset-4 transition-colors hover:text-primary"
      >
        {actionLabel}
      </Link>
    ) : null);

  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        {title ? (
          <h2 className="text-lg font-bold tracking-tight text-catch-charcoal sm:text-xl">
            {title}
          </h2>
        ) : null}
        {subtitle ? (
          <p className={cn("mt-1 text-xs text-catch-muted", subtitleClassName)}>
            {subtitle}
          </p>
        ) : null}
      </div>
      {actionNode ? (
        <div className="flex shrink-0 items-center">{actionNode}</div>
      ) : null}
    </div>
  );
}

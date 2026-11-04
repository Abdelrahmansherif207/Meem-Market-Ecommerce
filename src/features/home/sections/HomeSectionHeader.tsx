import type { ReactNode } from "react";

interface HomeSectionHeaderProps {
  title: string;
  /** Optional one-line subtitle under the headline (real data only). */
  subtitle?: string;
  /** Optional icon rendered in the rose square chip (design: flash deals). */
  icon?: ReactNode;
  /** Right-side action slot: countdown block, "View All" link, etc. */
  action?: ReactNode;
}

/**
 * Sovereign Rose section header: editorial serif headline with an optional
 * rose chip icon, subtitle and right-side action (Stitch design pattern).
 */
export default function HomeSectionHeader({
  title,
  subtitle,
  icon,
  action,
}: HomeSectionHeaderProps) {
  return (
    <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        {icon && (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-(--home-rose) text-white shadow-sm">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h2 className="home-display text-xl font-bold text-(--home-ink) sm:text-[1.375rem] lg:text-2xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 truncate text-xs text-text-secondary sm:text-sm">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

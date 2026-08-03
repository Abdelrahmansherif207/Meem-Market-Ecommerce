import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

export type ErrorStateVariant = "serverError" | "notFound" | "generic";

interface ErrorStateProps {
  variant: ErrorStateVariant;
  title: string;
  description?: string;
  actions?: ReactNode;
  /** Smaller inline variant used inside cards/sections. */
  compact?: boolean;
  className?: string;
}

const ILLUSTRATIONS: Record<ErrorStateVariant, string> = {
  serverError: "/images/empty-state/server-error.svg",
  notFound: "/images/empty-state/not-found.svg",
  generic: "/images/empty-state/server-error.svg",
};

export default function ErrorState({
  variant,
  title,
  description,
  actions,
  compact = false,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        compact ? "py-6" : "py-12",
        className,
      )}
    >
      <img
        src={ILLUSTRATIONS[variant]}
        alt=""
        aria-hidden
        className={cn(
          "w-full max-w-[300px] select-none",
          compact && "max-w-[120px]",
        )}
      />

      <h2
        className={cn(
          "font-bold text-text-primary",
          compact ? "text-sm" : "text-lg",
        )}
      >
        {title}
      </h2>

      {description && (
        <p
          className={cn(
            "text-text-secondary",
            compact
              ? "mt-1 max-w-xs text-xs"
              : "mt-2 max-w-sm text-sm leading-relaxed",
          )}
        >
          {description}
        </p>
      )}

      {actions && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          {actions}
        </div>
      )}
    </div>
  );
}

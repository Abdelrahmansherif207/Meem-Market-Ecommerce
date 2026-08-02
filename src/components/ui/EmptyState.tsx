import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

type EmptyStateVariant = "cart" | "notFound" | "orders" | "serverError" | "default";

interface EmptyStateProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  /** Smaller inline variant used inside cards/sections. */
  size?: "full" | "compact";
  /** Picks one of the 4 illustration SVGs from the empty-state design pack. */
  variant?: EmptyStateVariant;
  className?: string;
}

const ILLUSTRATIONS: Record<EmptyStateVariant, string> = {
  cart: "/images/empty-state/cart.svg",
  notFound: "/images/empty-state/not-found.svg",
  orders: "/images/empty-state/orders.svg",
  serverError: "/images/empty-state/server-error.svg",
  default: "/images/empty-state/not-found.svg",
};

export default function EmptyState({
  title,
  description,
  actions,
  size = "full",
  variant = "default",
  className,
}: EmptyStateProps) {
  const compact = size === "compact";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        className,
      )}
    >
      <img
        src={ILLUSTRATIONS[variant]}
        alt=""
        aria-hidden
        className={cn(
          "h-auto w-full max-w-[200px] select-none",
          compact && "max-w-[120px]",
        )}
      />

      <h2
        className={cn(
          "font-bold text-text-primary",
          compact ? "mt-3 text-sm" : "mt-5 text-lg",
        )}
      >
        {title}
      </h2>

      {description && (
        <p
          className={cn(
            "text-text-secondary",
            compact ? "mt-1 max-w-xs text-xs" : "mt-2 max-w-sm text-sm leading-relaxed",
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

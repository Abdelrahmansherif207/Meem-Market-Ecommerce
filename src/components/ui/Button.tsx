import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/shared/utils/cn";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  full?: boolean;
  children?: ReactNode;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white shadow-elev-1 hover:bg-primary-dark active:bg-primary-active",
  secondary:
    "bg-secondary text-white hover:bg-secondary-dark active:bg-secondary-dark",
  outline:
    "border border-border bg-white text-text-primary hover:border-primary/40 hover:text-primary",
  ghost:
    "bg-transparent text-text-secondary hover:bg-surface hover:text-text-primary",
  danger:
    "bg-error text-white hover:brightness-90 active:brightness-95",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 gap-1.5 rounded-lg px-3.5 text-xs font-semibold",
  md: "h-11 gap-2 rounded-lg px-5 text-sm font-semibold",
  lg: "h-12 gap-2 rounded-lg px-6 text-base font-semibold",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      loading = false,
      full = false,
      disabled,
      className,
      children,
      type = "button",
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={cn(
          "inline-flex select-none items-center justify-center whitespace-nowrap transition-all duration-200 disabled:pointer-events-none disabled:opacity-50",
          VARIANTS[variant],
          SIZES[size],
          full && "w-full",
          className,
        )}
        {...props}
      >
        {loading && <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />}
        {children}
      </button>
    );
  },
);

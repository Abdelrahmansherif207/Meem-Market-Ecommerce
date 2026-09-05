import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

type BadgeTone = "discount" | "primary" | "flash" | "success" | "error" | "neutral";

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}

/**
 * Product/section badge using the canonical ProductCard badge shape:
 * asymmetric rounded corners, bold micro text.
 */
export function Badge({ tone = "neutral", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center gap-1 rounded-bl-xl rounded-br-xs rounded-tl-xs rounded-tr-xl px-2 py-1 text-2xs font-bold leading-4 text-white",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const TONES: Record<BadgeTone, string> = {
  discount: "bg-discount",
  primary: "bg-primary",
  flash: "bg-discount",
  success: "bg-success",
  error: "bg-error",
  neutral: "bg-text-secondary",
};

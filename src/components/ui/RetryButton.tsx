"use client";

import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface RetryButtonProps {
  label?: string;
  compact?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function RetryButton({
  label = "Try again",
  compact = false,
  className,
  onClick,
}: RetryButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => {
        if (onClick) {
          onClick();
        } else {
          router.refresh();
        }
      }}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-primary/40 transition-all hover:bg-primary-dark hover:shadow-md",
        compact && "px-4 py-2 text-xs",
        className,
      )}
    >
      <RefreshCw className={compact ? "size-3.5" : "size-4"} />
      {label}
    </button>
  );
}

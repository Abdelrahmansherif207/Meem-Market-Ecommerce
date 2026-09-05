"use client";

import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "./Button";

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
    <Button
      onClick={() => {
        if (onClick) {
          onClick();
        } else {
          router.refresh();
        }
      }}
      size={compact ? "sm" : "md"}
      className={className}
    >
      <RefreshCw className={compact ? "size-3.5" : "size-4"} aria-hidden />
      {label}
    </Button>
  );
}

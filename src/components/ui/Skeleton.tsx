import { cn } from "@/shared/utils/cn";

interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(
        "relative isolate overflow-hidden rounded-md bg-surface",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:animate-[skeleton-shimmer_1.8s_infinite_linear]",
        "before:bg-gradient-to-r before:from-transparent before:via-text-primary/[0.12] before:to-transparent",
        "rtl:before:translate-x-full rtl:before:animate-[skeleton-shimmer-rtl_1.8s_infinite_linear]",
        className
      )}
    />
  );
}

import { Star } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface StarRatingProps {
  rating: number;
  size?: "sm" | "md";
}

export function StarRating({ rating, size = "sm" }: StarRatingProps) {
  const sizeClass = size === "md" ? "size-5" : "size-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeClass,
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-border text-border",
          )}
        />
      ))}
    </div>
  );
}
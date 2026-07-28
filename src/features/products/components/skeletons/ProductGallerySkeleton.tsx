import Skeleton from "@/components/ui/Skeleton";

export function ProductGallerySkeleton({ compact }: { compact?: boolean }) {
  return (
    <div className="space-y-4">
      <Skeleton className="aspect-square w-full rounded-2xl" />
      {!compact && (
        <div className="flex gap-2 overflow-x-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="size-16 shrink-0 rounded-lg" />
          ))}
        </div>
      )}
    </div>
  );
}

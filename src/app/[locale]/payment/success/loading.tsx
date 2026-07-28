import Skeleton from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="py-6 min-h-screen">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-3 w-4" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-4" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="mt-16 flex flex-col items-center gap-4">
        <Skeleton className="size-24 rounded-full" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="mt-6 h-32 w-full max-w-sm rounded-2xl" />
      </div>
    </div>
  );
}

import Skeleton from "@/components/ui/Skeleton";

export function AuthPageSkeleton() {
  return (
    <div className="relative isolate min-h-[760px] overflow-hidden rounded-3xl" aria-label="Loading authentication">
      <div className="flex min-h-[760px] items-center justify-center p-2">
        <div className="w-full max-w-[480px] rounded-xl border border-border/80 bg-white/92 p-4 shadow-[0_16px_38px_rgba(0,74,151,0.15)] backdrop-blur-md sm:p-6">
          <div className="flex flex-col items-center text-center mb-6">
            <Skeleton className="mb-4 h-[34px] w-[112px]" />
            <Skeleton className="mb-1 h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="space-y-4">
            <div className="flex gap-1 rounded-xl bg-surface p-1">
              <Skeleton className="h-9 flex-1 rounded-lg" />
              <Skeleton className="h-9 flex-1 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
            <Skeleton className="h-12 w-full rounded-xl" />
            <div className="flex justify-center">
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

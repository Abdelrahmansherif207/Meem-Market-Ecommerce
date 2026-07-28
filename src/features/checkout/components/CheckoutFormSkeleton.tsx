import Skeleton from "@/components/ui/Skeleton";

export function CheckoutFormSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-2xl border-2 border-border bg-white p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Skeleton className="h-1 w-6 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl sm:col-span-2" />
          </div>
        </div>

        <div className="rounded-2xl border-2 border-border bg-white p-6 space-y-4">
          <Skeleton className="h-4 w-20" />
          <div className="flex gap-3">
            <Skeleton className="h-14 flex-1 rounded-xl" />
            <Skeleton className="h-14 flex-1 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>

        <div className="rounded-2xl border-2 border-border bg-white p-6 space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>

        <div className="rounded-2xl border-2 border-border bg-white p-6 space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="rounded-2xl border-2 border-border bg-white p-5 space-y-4">
          <Skeleton className="h-4 w-28" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

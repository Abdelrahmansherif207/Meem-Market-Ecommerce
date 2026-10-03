import Skeleton from "@/components/ui/Skeleton";

/** Stepper skeleton: 4 numbered circles with connectors (desktop) + pill (mobile). */
function StepperSkeleton() {
  return (
    <div>
      <div className="hidden md:flex md:items-start">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`relative flex flex-col items-center ${i < 3 ? "flex-1" : ""}`}>
            {i < 3 && (
              <span className="absolute top-4 start-[calc(50%+1.5rem)] end-[calc(-50%+1.5rem)] h-0.5 rounded-full bg-border" />
            )}
            <Skeleton className="relative z-10 size-8 rounded-full" />
            <Skeleton className="mt-2 h-3 w-14" />
          </div>
        ))}
      </div>
      <div className="md:hidden">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="mt-2 h-1.5 w-full rounded-full" />
      </div>
    </div>
  );
}

export function CheckoutFormSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <StepperSkeleton />

        <div className="rounded-2xl border-2 border-border bg-white p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Skeleton className="h-1 w-6 rounded-full" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl sm:col-span-2" />
          </div>
        </div>

        <div className="rounded-2xl border-2 border-border bg-white p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-1 w-6 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-14 flex-1 rounded-xl" />
            <Skeleton className="h-14 flex-1 rounded-xl" />
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl sm:col-span-2" />
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>

        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-11 w-24 rounded-xl" />
          <Skeleton className="h-11 w-32 rounded-xl" />
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

export function ProfileSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 rounded-full bg-gray-200" />
        <div className="space-y-2 flex-1">
          <div className="h-5 w-40 rounded bg-gray-200" />
          <div className="h-4 w-60 rounded bg-gray-200" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="h-4 w-3/4 rounded bg-gray-200" />
      </div>
    </div>
  );
}

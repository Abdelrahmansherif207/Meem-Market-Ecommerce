export function ProfileSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 rounded-full bg-border" />
        <div className="space-y-2 flex-1">
          <div className="h-5 w-40 rounded bg-border" />
          <div className="h-4 w-60 rounded bg-border" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 w-full rounded bg-border" />
        <div className="h-4 w-3/4 rounded bg-border" />
      </div>
    </div>
  );
}

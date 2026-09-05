export function AddressSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2].map((i) => (
        <div key={i} className="rounded-2xl border-2 border-border bg-white p-4 space-y-2">
          <div className="h-4 w-24 rounded bg-border" />
          <div className="h-3 w-full rounded bg-border" />
          <div className="h-3 w-3/4 rounded bg-border" />
        </div>
      ))}
    </div>
  );
}

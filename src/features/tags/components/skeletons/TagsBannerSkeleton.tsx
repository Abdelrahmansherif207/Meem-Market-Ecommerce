export default function TagsBannerSkeleton() {
  return (
    <section className="w-full overflow-hidden rounded-2xl bg-gradient-to-b from-black via-[#1a1a1a] to-[#2a2a2a]">
      <div className="flex flex-col gap-6 px-6 py-8 sm:px-10 sm:py-10 lg:px-12">
        <div className="h-4 w-32 animate-pulse rounded bg-white/20" />
        <div className="h-10 w-64 animate-pulse rounded bg-white/20" />
        <div className="flex gap-2.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 w-24 animate-pulse rounded-full bg-white/10" />
          ))}
        </div>
        <div className="h-10 w-32 animate-pulse rounded-full bg-white/20" />
      </div>
    </section>
  );
}

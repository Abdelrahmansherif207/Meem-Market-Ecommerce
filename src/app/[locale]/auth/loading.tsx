import { AuthPageSkeleton } from "@/features/auth/components/skeletons/AuthPageSkeleton";

export default function Loading() {
  return (
    <main className="py-6 sm:py-10">
      <AuthPageSkeleton />
    </main>
  );
}

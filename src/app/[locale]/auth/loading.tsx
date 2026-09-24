import { AuthPageSkeleton } from "@/features/auth";

export default function Loading() {
  return (
    <main className="py-6 sm:py-10">
      <AuthPageSkeleton />
    </main>
  );
}

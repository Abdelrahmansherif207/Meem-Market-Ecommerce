import { CheckoutFormSkeleton } from "@/features/checkout/components/CheckoutFormSkeleton";

export default function Loading() {
  return (
    <div className="py-6 min-h-screen">
      <div className="mt-6">
        <CheckoutFormSkeleton />
      </div>
    </div>
  );
}

"use client";

import { RouteError } from "@/components/ui/RouteError";

export default function GuestCheckoutError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError {...props} logLabel="Guest checkout" />;
}

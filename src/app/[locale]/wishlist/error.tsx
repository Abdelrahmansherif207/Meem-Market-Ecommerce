"use client";

import { RouteError } from "@/components/ui/RouteError";

export default function WishlistError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError {...props} logLabel="Wishlist" />;
}

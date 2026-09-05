"use client";

import { RouteError } from "@/components/ui/RouteError";

export default function TagsError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteError {...props} logLabel="Tags" />;
}

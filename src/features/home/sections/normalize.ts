/**
 * Section endpoints usually return a bare array, but the backend can
 * also answer with a paginated `{ data: [...] }` wrapper (products) or
 * a transient `null`. Tolerate every shape so a single bad payload
 * renders an empty section instead of crashing the error boundary.
 */
export function normalizeList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object" && "data" in payload) {
    const data = (payload as { data?: unknown }).data;
    if (Array.isArray(data)) return data as T[];
  }
  return [];
}

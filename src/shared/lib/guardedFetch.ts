import { ApiError } from "@/shared/lib/api";
import { withRetry } from "@/shared/utils/retry";

export type ServerLoadKind = "not-found" | "server-down" | "generic";

export type LoadResult<T> =
  | { ok: true; data: T }
  | { ok: false; kind: ServerLoadKind };

export async function guardLoad<T>(
  fn: () => Promise<T>,
  options?: { retries?: number },
): Promise<LoadResult<T>> {
  const retries = options?.retries ?? 0;
  const run = retries > 0 ? () => withRetry(fn, { retries }) : fn;

  try {
    return { ok: true, data: await run() };
  } catch (err) {
    return { ok: false, kind: classifyServerError(err) };
  }
}

export function classifyServerError(err: unknown): ServerLoadKind {
  if (err instanceof ApiError) {
    if (err.status === 404) return "not-found";
    if (err.status >= 500) return "server-down";
    return "generic";
  }
  if (err instanceof TypeError && /fetch|network|load/i.test(err.message)) {
    return "server-down";
  }
  if (err instanceof DOMException && err.name === "AbortError") {
    return "server-down";
  }
  return "generic";
}

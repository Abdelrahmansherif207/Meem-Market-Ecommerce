import { ApiError } from "@/shared/lib/api";

type ServerErrorKind = "server-down" | "auth" | "generic";

function classifyError(error: Error): ServerErrorKind {
  if (error instanceof ApiError && error.status === 401) return "auth";
  if (error instanceof ApiError && error.status >= 500) return "server-down";
  if (error instanceof TypeError && /fetch|network|load/i.test(error.message)) {
    return "server-down";
  }
  if (error instanceof DOMException && error.name === "AbortError") {
    return "server-down";
  }
  return "generic";
}

export function isServerDownError(error: Error): boolean {
  return classifyError(error) === "server-down";
}

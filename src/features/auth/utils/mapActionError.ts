import { ApiError } from "@/shared/lib/api";

export interface MappedActionError {
  message: string;
  fieldErrors?: Record<string, string>;
}

/** Maps a thrown error from the API layer into ActionState-compatible fields. */
export function mapActionError(error: unknown, fallback: string): MappedActionError {
  if (error instanceof ApiError) {
    const mapped: Record<string, string> = {};
    for (const [key, msgs] of Object.entries(error.fields)) {
      mapped[key] = Array.isArray(msgs) ? msgs[0] : String(msgs);
    }
    const hasFields = Object.keys(mapped).length > 0;
    return {
      message: hasFields ? Object.values(mapped).join(" ") : error.message,
      fieldErrors: hasFields ? mapped : undefined,
    };
  }
  return { message: fallback };
}

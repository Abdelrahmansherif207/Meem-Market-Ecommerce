import { AUTH_TOKEN_STORAGE_KEY, CHANNEL_STORAGE_KEY } from "@/shared/constants/storageKeys";

export class ApiError extends Error {
  status: number;
  fields: Record<string, string[]>;

  constructor(message: string, status: number = 500, fields: Record<string, string[]> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function getAuthToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

async function getChannel() {
  if (typeof window === "undefined") {
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      return cookieStore.get(CHANNEL_STORAGE_KEY)?.value ?? "home";
    } catch {
      return "home";
    }
  }
  return window.localStorage.getItem(CHANNEL_STORAGE_KEY) ?? "home";
}

function extractApiMessage(body: Record<string, unknown>): string | undefined {
  return (body.message as string) || (body.data as Record<string, unknown> | undefined)?.message as string | undefined;
}

function extractApiErrors(body: Record<string, unknown>): Record<string, string[]> | undefined {
  const isErrorMap = (obj: Record<string, unknown>): obj is Record<string, string[]> => {
    const skipKeys = new Set(["message", "status", "success", "data"]);
    const entries = Object.entries(obj).filter(([k]) => !skipKeys.has(k));
    if (entries.length === 0) return false;
    return entries.every(
      ([, v]) => Array.isArray(v) && v.every((s) => typeof s === "string"),
    );
  };

  if (body.errors && typeof body.errors === "object") {
    return body.errors as Record<string, string[]>;
  }
  if (body.data && typeof body.data === "object") {
    const data = body.data as Record<string, unknown>;
    if (data.errors && typeof data.errors === "object") {
      return data.errors as Record<string, string[]>;
    }
    if (isErrorMap(data)) {
      return data as Record<string, string[]>;
    }
  }
  if (isErrorMap(body)) {
    return body as Record<string, string[]>;
  }
  return undefined;
}

type ApiFetchOptions = RequestInit & {
  next?: { revalidate?: false | 0 | number; tags?: string[] };
  lang?: string;
  /** Request timeout in ms. Defaults to 15000. Set to 0 to disable. */
  timeout?: number;
  /** Set to false to skip the X-Channel header (e.g. status endpoint). */
  channel?: boolean;
};

export async function apiFetch<T>(
  endpoint: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  if (!BASE_URL) {
    throw new Error("Missing NEXT_PUBLIC_API_URL environment variable.");
  }

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${cleanEndpoint}`;
  const authToken = getAuthToken();
  const headers = new Headers(options.headers);

  const hasFormDataBody =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  if (!headers.has("Content-Type") && !hasFormDataBody) {
    headers.set("Content-Type", "application/json");
  }

  if (authToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  if (options.lang && !headers.has("lang")) {
    headers.set("lang", options.lang);
  }

  const channel = options.channel !== false ? await getChannel() : null;
  if (channel && !headers.has("X-Channel")) {
    headers.set("X-Channel", channel);
  }

  const enableLogs = process.env.NEXT_PUBLIC_XHR_LOGS === "true";
  const method = (options.method ?? "GET").toUpperCase();
  const start = Date.now();

  const timeoutMs = options.timeout ?? 15000;
  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  if (timeoutMs > 0) {
    timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  }

  const userSignal = options.signal;
  if (userSignal) {
    if (userSignal.aborted) {
      controller.abort();
    } else {
      userSignal.addEventListener("abort", () => controller.abort());
    }
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers,
    });
  } catch (err: any) {
    if (enableLogs) {
      console.error("? " + method + " " + url + " - network error", err?.message ?? err);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  const duration = Date.now() - start;

  let parsedBody: any = null;
  try {
    const ct = response.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      parsedBody = await response.clone().json();
    } else {
      parsedBody = await response.clone().text();
    }
  } catch {
    parsedBody = "<unreadable>";
  }

  if (response.ok) {
    if (enableLogs) {
      console.log("? " + method + " " + url + " " + response.status + " " + duration + "ms", parsedBody);
    }
    return parsedBody as T;
  }

  let errorMessage = "API Error: " + response.status + " " + response.statusText;

  if (parsedBody && typeof parsedBody === "object") {
    const apiMessage = extractApiMessage(parsedBody);
    if (apiMessage) {
      errorMessage = apiMessage;
    }

    const apiErrors = extractApiErrors(parsedBody);
    if (apiErrors) {
      throw new ApiError(errorMessage, response.status, apiErrors);
    }

    if (!apiMessage) {
      errorMessage = "Request failed with status " + response.status + ".";
    }
  } else if (typeof parsedBody === "string" && parsedBody.length) {
    errorMessage = parsedBody;
  }

  if (enableLogs) {
    console.error("? " + method + " " + url + " " + response.status + " " + duration + "ms", {
      errorMessage,
      response: parsedBody,
    });
  }

  throw new ApiError(errorMessage, response.status);
}

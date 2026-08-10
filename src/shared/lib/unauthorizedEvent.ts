type UnauthorizedHandler = () => void;

let unauthorizedHandler: UnauthorizedHandler | null = null;
let hasPendingUnauthorized = false;

export function notifyUnauthorized(): void {
  if (typeof window === "undefined") return;

  if (unauthorizedHandler) {
    unauthorizedHandler();
  } else {
    hasPendingUnauthorized = true;
  }
}

export function registerUnauthorizedHandler(
  handler: UnauthorizedHandler,
): () => void {
  unauthorizedHandler = handler;

  if (hasPendingUnauthorized) {
    hasPendingUnauthorized = false;
    handler();
  }

  return () => {
    if (unauthorizedHandler === handler) unauthorizedHandler = null;
  };
}

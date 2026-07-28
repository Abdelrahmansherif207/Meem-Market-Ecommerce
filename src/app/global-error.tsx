"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body className="flex min-h-dvh items-center justify-center bg-white p-4">
        <div className="text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-red-100">
            <span className="text-2xl font-bold text-red-600">!</span>
          </div>
          <h1 className="mt-4 text-xl font-bold text-gray-900">
            Something went wrong
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            A critical error occurred. Please reload the page.
          </p>
          <button
            onClick={reset}
            className="mt-6 rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
          >
            Reload page
          </button>
        </div>
      </body>
    </html>
  );
}

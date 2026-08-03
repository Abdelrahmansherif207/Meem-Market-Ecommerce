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
    console.error("Global error:", error, error.digest ? `digest: ${error.digest}` : "");
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#ffffff" }}>
        <div
          style={{
            minHeight: "100dvh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: "420px" }}>
            <img
              src="/images/empty-state/server-error.svg"
              alt=""
              aria-hidden
              style={{ width: "100%", maxWidth: "300px", margin: "0 auto" }}
            />
            <h1
              style={{
                marginTop: "16px",
                fontSize: "20px",
                fontWeight: 700,
                color: "#111827",
              }}
            >
              Something went wrong
            </h1>
            <p
              style={{
                marginTop: "8px",
                fontSize: "14px",
                lineHeight: "1.5",
                color: "#6b7280",
              }}
            >
              A critical error occurred. Please try again.
            </p>
            <button
              onClick={reset}
              style={{
                marginTop: "24px",
                borderRadius: "12px",
                background: "#111827",
                padding: "10px 24px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#ffffff",
                border: "none",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

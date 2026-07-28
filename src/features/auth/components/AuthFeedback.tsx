"use client";

interface AuthFeedbackProps {
  error?: string | null;
  success?: string | null;
  feedback?: string | null;
}

export function AuthFeedback({ error, success, feedback }: AuthFeedbackProps) {
  return (
    <>
      {error ? (
        <p className="mx-auto mt-4 max-w-md rounded-lg border border-secondary/30 bg-secondary/10 px-3 py-2 text-sm text-secondary">
          {error}
        </p>
      ) : null}
      {feedback ? (
        <p className="mx-auto mt-4 max-w-md rounded-lg border border-secondary/30 bg-secondary/10 px-3 py-2 text-sm text-secondary">
          {feedback}
        </p>
      ) : null}
      {success ? (
        <p className="mx-auto mt-4 max-w-md rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
          {success}
        </p>
      ) : null}
    </>
  );
}

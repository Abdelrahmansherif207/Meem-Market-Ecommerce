import EmptyState from "./EmptyState";
import type { EmptyStateVariant } from "./EmptyState";

export type ErrorStateVariant = "serverError" | "notFound" | "generic";

interface ErrorStateProps {
  variant: ErrorStateVariant;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  /** Smaller inline variant used inside cards/sections. */
  compact?: boolean;
}

const ILLUSTRATIONS: Record<ErrorStateVariant, EmptyStateVariant> = {
  serverError: "serverError",
  notFound: "notFound",
  generic: "serverError",
};

/**
 * Error presentation. Delegates to the shared EmptyState layout so both
 * components stay pixel-identical; this wrapper only maps error variants.
 */
export default function ErrorState({
  variant,
  title,
  description,
  actions,
  compact = false,
}: ErrorStateProps) {
  return (
    <EmptyState
      title={title}
      description={description}
      actions={actions}
      size={compact ? "compact" : "full"}
      variant={ILLUSTRATIONS[variant]}
      className={compact ? "py-6 justify-center" : "py-12 justify-center"}
    />
  );
}

"use client";

import { Component, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import ErrorState from "@/components/ui/ErrorState";
import RetryButton from "@/components/ui/RetryButton";

function SectionErrorFallback({ onResetBoundary }: { onResetBoundary: () => void }) {
  const t = useTranslations("error");

  return (
    <ErrorState
      compact
      variant="serverError"
      title={t("serverDownTitle")}
      description={t("serverDownDesc")}
      actions={<RetryButton compact label={t("retry")} onClick={onResetBoundary} />}
    />
  );
}

interface SectionErrorBoundaryState {
  hasError: boolean;
}

class SectionErrorBoundaryClass extends Component<
  { children: ReactNode },
  SectionErrorBoundaryState
> {
  state: SectionErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): SectionErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Section render error:", error);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return <SectionErrorFallback onResetBoundary={this.handleRetry} />;
    }
    return this.props.children;
  }
}

export function SectionErrorBoundary({ children }: { children: ReactNode }) {
  return <SectionErrorBoundaryClass>{children}</SectionErrorBoundaryClass>;
}

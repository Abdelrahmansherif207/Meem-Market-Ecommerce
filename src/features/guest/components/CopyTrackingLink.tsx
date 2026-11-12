"use client";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, Copy, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CopyTrackingLinkProps {
  /** A token that has already been verified against the tracking endpoint. */
  token: string;
}

/** Hash-based so the token never reaches the server or a referrer. */
function buildTrackingUrl(origin: string, locale: string, token: string): string {
  return `${origin}/${locale}/track-order#token=${encodeURIComponent(token)}`;
}

/**
 * Lets a guest save the tracking link after losing the confirmation page.
 * Feedback is inline on the button so the hint text stays put.
 */
export function CopyTrackingLink({ token }: CopyTrackingLinkProps) {
  const t = useTranslations("guestCheckout.tracking");
  const locale = useLocale();
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  const showStatus = (next: "copied" | "failed") => {
    setStatus(next);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setStatus("idle"), 2500);
  };

  const handleCopy = async () => {
    const url = buildTrackingUrl(window.location.origin, locale, token);
    try {
      if (!navigator.clipboard?.writeText) throw new Error("clipboard unavailable");
      await navigator.clipboard.writeText(url);
      showStatus("copied");
    } catch {
      showStatus("failed");
    }
  };

  return (
    <div className="space-y-2">
      <Button type="button" variant="outline" full onClick={handleCopy}>
        {status === "copied" ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : status === "failed" ? (
          <TriangleAlert className="h-4 w-4 text-red-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
        {status === "copied"
          ? t("copied")
          : status === "failed"
            ? t("copyFailed")
            : t("copyLink")}
      </Button>
      <p className="text-[11px] leading-relaxed text-text-secondary">
        {t("copyHint")}
      </p>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

interface VariantDialogProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
}

export function VariantDialog({ isOpen, onClose, slug }: VariantDialogProps) {
  const t = useTranslations("variantDialog");
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) onClose();
  }

  function handleShowDetails() {
    router.push(`/products/${slug}`);
  }

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
    >
      <div className="relative w-full max-w-sm rounded-2xl bg-background p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute end-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-surface text-text-primary transition hover:bg-border"
        >
          <X className="h-4 w-4" />
        </button>

        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          {t("title")}
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleShowDetails}
            className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white transition hover:bg-primary-dark"
          >
            {t("showDetails")}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-border py-3 text-sm font-bold text-text-primary transition hover:bg-surface"
          >
            {t("cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}

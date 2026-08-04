"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/utils/cn";
import type { FooterData, SocialLink } from "../../types";
import FooterMobileContent from "../footer/FooterMobileContent";
import FooterContactCard from "../footer/FooterContactCard";

interface Props {
  data: FooterData;
  logoSrc: string;
  siteName: string;
  copyright: string;
  mergedSocialLinks: SocialLink[];
}

export default function MobileFooterDrawer({
  data,
  logoSrc,
  siteName,
  copyright,
  mergedSocialLinks,
}: Props) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("header.common");

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("openMenu")}
        className="inline-flex items-center justify-center p-1"
      >
        <Menu className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[100]">
          <div
            className="absolute inset-x-0 top-0 h-[calc(100%-56px)] bg-black/50"
            onClick={close}
          />
          <div
            className={cn(
              "relative flex h-[calc(100%-56px)] w-[320px] max-w-[85vw] flex-col bg-black text-white shadow-xl",
              "animate-in slide-in-from-left duration-300",
            )}
          >
            <div className="flex shrink-0 items-center justify-end border-b border-white/20 px-4 py-3">
              <button
                type="button"
                onClick={close}
                aria-label={t("closeMenu")}
                className="p-1 rounded transition-colors hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-2">
              <FooterMobileContent
                data={data}
                logoSrc={logoSrc}
                siteName={siteName}
                copyright={copyright}
                mergedSocialLinks={mergedSocialLinks}
                showContactCard={false}
                showCopyright={false}
              />
            </div>
            <div className="shrink-0 border-t border-white/20 px-4 py-3">
              <FooterContactCard contactInfo={data.contactInfo} vertical />
              {copyright && (
                <p className="mt-2 pb-1 text-center text-xs text-white/60">
                  {copyright}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

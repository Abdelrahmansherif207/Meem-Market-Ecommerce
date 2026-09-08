"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/shared/utils/cn";
import { useChannelStore } from "@/features/fast-shipping/store/useChannelStore";
import { useFastShippingStatusStore } from "@/features/fast-shipping/store/useFastShippingStatusStore";
import { currencyLabel } from "@/shared/utils/formatMoney";
import { DeliveryModeButton } from "./DeliveryModeButton";
import type { Channel } from "@/features/fast-shipping/store/useChannelStore";

export default function DeliveryModes({ compact = false }: { compact?: boolean }) {
  const t = useTranslations("header.deliveryModes");
  const locale = useLocale();
  const channel = useChannelStore((s) => s.channel);
  const setChannel = useChannelStore((s) => s.setChannel);
  const { status, loading, fetchStatus } = useFastShippingStatusStore();
  const [scrolled, setScrolled] = useState(false);
  // Scrolled header: keep the icons, just render everything smaller.
  const small = compact ? false : scrolled;

  useEffect(() => {
    fetchStatus(locale);
  }, [fetchStatus, locale]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isFastAvailable = !!status?.enabled && !!status?.available;
  // While the settings response hasn't arrived yet, don't render the NOW
  // button as disabled — previously `status === null` read as unavailable
  // and stuck fast shipping in a disabled state on every first paint.
  const isDetermined = status !== null && !loading;
  const fee = status?.fee ?? 0;
  const duration = status?.duration_minutes ?? 0;
  const currency = currencyLabel(locale);
  // While settings are loading, show a spinner instead of a fake default ETA.
  const eta: ReactNode = !isDetermined ? (
    <span className="inline-flex items-center" aria-label="loading">
      <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
    </span>
  ) : duration >= 60 ? (
    `~${Math.floor(duration / 60)}h ${duration % 60}m (+${currency} ${fee.toFixed(2)})`
  ) : (
    `~${duration} min (+${currency} ${fee.toFixed(2)})`
  );

  const handleChannelChange = (newChannel: Channel) => {
    if (newChannel === "fast-shipping" && isDetermined && !isFastAvailable) return;
    if (newChannel === channel) return;
    setChannel(newChannel);
    window.location.reload();
  };

  if (compact) {
    return (
      <div className="flex w-full items-center gap-0.5 rounded-lg border border-black/[0.06] bg-white/80 p-0.5 shadow-elev-1 backdrop-blur">
        <DeliveryModeButton
          label={t("scheduled")}
          icon={{ src: "/scheduled.avif", alt: "Scheduled" }}
          bgClass={channel === "home" ? "bg-primary shadow-md shadow-primary/25 ring-1 ring-primary" : "bg-transparent hover:bg-primary/5"}
          borderClass={""}
          textClass={channel === "home" ? "text-white" : "text-primary"}
          compact
          onClick={() => handleChannelChange("home")}
        />
        <DeliveryModeButton
          label={t("now")}
          icon={{ src: "/now.avif", alt: "NOW" }}
          bgClass={channel === "fast-shipping" ? "bg-accent shadow-md shadow-accent/25 ring-1 ring-accent" : "bg-transparent hover:bg-accent/5"}
          borderClass={""}
          textClass={channel === "fast-shipping" ? "text-white" : "text-accent"}
          etaText={eta}
          note={t("unavailable")}
          compact
          onClick={() => handleChannelChange("fast-shipping")}
          disabled={isDetermined && !isFastAvailable && channel !== "fast-shipping"}
        />
      </div>
    );
  }

  return (
    <div className={cn(
      "no-scrollbar flex w-full items-center overflow-x-auto",
      "gap-2.5 py-1.5",
    )}>
      <DeliveryModeButton
        label={t("scheduled")}
        icon={{ src: "/scheduled.avif", alt: "Scheduled" }}
        bgClass={channel === "home" ? "bg-primary hover:bg-primary-active" : "bg-white hover:bg-primary/5"}
        borderClass={channel === "home" ? "md:border-white" : "border-2 border-primary"}
        textClass={channel === "home" ? "text-white" : "text-primary"}
        small={small}
        onClick={() => handleChannelChange("home")}
      />
      <DeliveryModeButton
        label={t("now")}
        icon={{ src: "/now.avif", alt: "NOW" }}
        bgClass={channel === "fast-shipping" ? "bg-accent hover:opacity-90" : "bg-white hover:bg-accent/5"}
        borderClass={""}
        textClass={channel === "fast-shipping" ? "text-white" : "text-accent"}
        etaText={eta}
        small={small}
        onClick={() => handleChannelChange("fast-shipping")}
        disabled={isDetermined && !isFastAvailable && channel !== "fast-shipping"}
      />
    </div>
  );
}

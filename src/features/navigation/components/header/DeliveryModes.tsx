"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/utils/cn";
import { useChannelStore } from "@/features/fast-shipping/store/useChannelStore";
import { useFastShippingStatusStore } from "@/features/fast-shipping/store/useFastShippingStatusStore";
import { DeliveryModeButton } from "./DeliveryModeButton";
import type { Channel } from "@/features/fast-shipping/store/useChannelStore";

export default function DeliveryModes({ compact = false }: { compact?: boolean }) {
  const t = useTranslations("header.deliveryModes");
  const channel = useChannelStore((s) => s.channel);
  const setChannel = useChannelStore((s) => s.setChannel);
  const { status, fetchStatus } = useFastShippingStatusStore();
  const [scrolled, setScrolled] = useState(false);
  const hideIcons = compact ? false : scrolled;

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isFastAvailable = status?.enabled && status?.available;
  const fee = status?.fee ?? 0;
  const duration = status?.duration_minutes ?? 120;
  const etaText = duration >= 60
    ? `~${Math.floor(duration / 60)}h ${duration % 60}m (+K.D ${fee.toFixed(2)})`
    : `~${duration} min (+K.D ${fee.toFixed(2)})`;

  const handleChannelChange = (newChannel: Channel) => {
    if (newChannel === "fast-shipping" && !isFastAvailable) return;
    if (newChannel === channel) return;
    setChannel(newChannel);
    window.location.reload();
  };

  if (compact) {
    return (
      <div className="flex w-fit max-w-full items-stretch gap-1 rounded-xl border border-text-muted/20 bg-white/60 p-0.5 shadow-elev-1">
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
          etaText={etaText}
          note={t("unavailable")}
          compact
          onClick={() => handleChannelChange("fast-shipping")}
          disabled={!isFastAvailable && channel !== "fast-shipping"}
        />
      </div>
    );
  }

  return (
    <div className={cn(
      "no-scrollbar flex w-full items-center overflow-x-auto",
      "gap-3 py-2",
    )}>
      <DeliveryModeButton
        label={t("scheduled")}
        icon={{ src: "/scheduled.avif", alt: "Scheduled" }}
        bgClass={channel === "home" ? "bg-primary hover:bg-primary-active" : "bg-white hover:bg-primary/5"}
        borderClass={channel === "home" ? "md:border-white" : "border-2 border-primary"}
        textClass={channel === "home" ? "text-white" : "text-primary"}
        hideIcon={hideIcons}
        onClick={() => handleChannelChange("home")}
      />
      <DeliveryModeButton
        label={t("now")}
        icon={{ src: "/now.avif", alt: "NOW" }}
        bgClass={channel === "fast-shipping" ? "bg-accent hover:opacity-90" : "bg-white hover:bg-accent/5"}
        borderClass={""}
        textClass={channel === "fast-shipping" ? "text-white" : "text-accent"}
        etaText={etaText}
        hideIcon={hideIcons}
        onClick={() => handleChannelChange("fast-shipping")}
        disabled={!isFastAvailable && channel !== "fast-shipping"}
      />
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useChannelStore } from "@/features/fast-shipping/store/useChannelStore";
import { useFastShippingStatusStore } from "@/features/fast-shipping/store/useFastShippingStatusStore";
import { DeliveryModeButton } from "./DeliveryModeButton";
import type { Channel } from "@/features/fast-shipping/store/useChannelStore";

export default function DeliveryModes() {
  const t = useTranslations("header.deliveryModes");
  const channel = useChannelStore((s) => s.channel);
  const setChannel = useChannelStore((s) => s.setChannel);
  const { status, fetchStatus } = useFastShippingStatusStore();

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

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

  return (
    <div className="no-scrollbar flex w-full items-center gap-3 overflow-x-auto py-2">
      <DeliveryModeButton
        label={t("scheduled")}
        icon={{ src: "/scheduled.avif", alt: "Scheduled" }}
        bgClass={channel === "home" ? "bg-primary" : "bg-white"}
        borderClass={channel === "home" ? "border-white" : "border-primary"}
        textClass={channel === "home" ? "text-white" : "text-primary"}
        onClick={() => handleChannelChange("home")}
      />
      <DeliveryModeButton
        label={t("now")}
        icon={{ src: "/now.avif", alt: "NOW" }}
        bgClass={channel === "fast-shipping" ? "bg-accent" : "bg-white"}
        borderClass={channel === "fast-shipping" ? "border-white" : "border-accent"}
        textClass={channel === "fast-shipping" ? "text-white" : "text-accent"}
        etaText={etaText}
        onClick={() => handleChannelChange("fast-shipping")}
        disabled={!isFastAvailable && channel !== "fast-shipping"}
      />
    </div>
  );
}

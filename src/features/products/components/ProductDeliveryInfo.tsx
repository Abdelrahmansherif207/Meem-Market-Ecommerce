"use client";

import { Truck, RotateCcw, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

export function ProductDeliveryInfo() {
  const t = useTranslations("product");

  return (
    <div className="space-y-3">
      <DeliveryCard
        icon={<Truck className="size-5" />}
        title={t("deliveryTitle")}
        description={t("deliveryDesc")}
      />
      <DeliveryCard
        icon={<ShieldCheck className="size-5" />}
        title={t("shippingTitle")}
        description={t("shippingDesc")}
      />
      <DeliveryCard
        icon={<RotateCcw className="size-5" />}
        title={t("returnsTitle")}
        description={t("returnsDesc")}
      />
    </div>
  );
}

function DeliveryCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-surface p-3">
      <div className="mt-0.5 text-primary">{icon}</div>
      <div>
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        <p className="text-xs text-text-secondary">{description}</p>
      </div>
    </div>
  );
}

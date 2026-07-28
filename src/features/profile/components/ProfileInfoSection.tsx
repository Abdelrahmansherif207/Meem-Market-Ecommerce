"use client";

import { User, Mail, Phone, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Profile } from "../types";

interface ProfileInfoSectionProps {
  profile: Profile;
}

export function ProfileInfoSection({ profile }: ProfileInfoSectionProps) {
  const t = useTranslations("profile");

  const infoItems = [
    { icon: User, label: t("info.name"), value: profile.name },
    { icon: Mail, label: t("info.email"), value: profile.email },
    { icon: Phone, label: t("info.phone"), value: profile.email },
    { icon: ShieldCheck, label: t("info.status"), value: profile.is_active ? t("info.active") : t("info.inactive") },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          {profile.image ? (
            <img
              src={profile.image}
              alt={profile.name}
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <User className="h-8 w-8 text-primary" />
          )}
        </div>
        <div className="text-center sm:text-left">
          <h2 className="text-xl font-bold text-text-primary">{profile.name}</h2>
          <p className="text-sm text-text-secondary">{profile.email}</p>
        </div>
      </div>

      <div className="rounded-2xl border-2 border-border bg-white divide-y divide-border">
        {infoItems.map((item) => (
          <div key={item.label} className="flex items-center gap-3 px-5 py-4">
            <item.icon className="h-5 w-5 text-text-secondary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">{item.label}</p>
              <p className="text-sm font-semibold text-text-primary truncate">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

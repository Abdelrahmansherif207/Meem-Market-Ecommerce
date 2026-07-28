"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { User, Package, MapPin, Lock, Loader2 } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { profileService } from "../services/profileService";
import type { Profile, ProfileTab } from "../types";
import { ProfileInfoSection } from "./ProfileInfoSection";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { AddressSection } from "./AddressSection";
import { OrdersSection } from "./OrdersSection";
import { ProfileSkeleton } from "./skeletons/ProfileSkeleton";
import { cn } from "@/shared/utils/cn";

const tabs: { key: ProfileTab; icon: typeof User; labelKey: string }[] = [
  { key: "info", icon: User, labelKey: "tabs.info" },
  { key: "orders", icon: Package, labelKey: "tabs.orders" },
  { key: "addresses", icon: MapPin, labelKey: "tabs.addresses" },
  { key: "security", icon: Lock, labelKey: "tabs.security" },
];

export function ProfileTabs() {
  const t = useTranslations("profile");
  const router = useRouter();
  const { isAuthenticated, setProfile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<ProfileTab>("info");
  const [profile, setProfileData] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/auth");
      return;
    }

    profileService.getProfile()
      .then((data) => {
        setProfileData(data);
        setProfile(data.id, data.name, data.image);
      })
      .catch((err) => setError(err instanceof Error ? err.message : t("loadError")))
      .finally(() => setLoading(false));
  }, [isAuthenticated, router, setProfile, t]);

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="py-8">
        <ProfileSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Loader2 className="mb-3 h-8 w-8 animate-spin text-red-500" />
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-1 rounded-xl bg-surface p-1 overflow-x-auto">
        {tabs.map(({ key, icon: Icon, labelKey }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all whitespace-nowrap",
              activeTab === key
                ? "bg-white text-primary shadow-sm"
                : "text-text-secondary hover:text-text-primary",
            )}
          >
            <Icon className="h-4 w-4" />
            {t(labelKey)}
          </button>
        ))}
      </div>

      {activeTab === "info" && profile && <ProfileInfoSection profile={profile} />}
      {activeTab === "orders" && <OrdersSection />}
      {activeTab === "addresses" && profile && <AddressSection customerId={profile.id} />}
      {activeTab === "security" && <ChangePasswordForm />}
    </div>
  );
}

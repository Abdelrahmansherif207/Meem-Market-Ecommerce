"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { User, Package, MapPin, Lock, FileText, Loader2, Ticket } from "lucide-react";
import { useAuthStore, useRequireAuth } from "@/features/auth";
import { profileService } from "../services/profileService";
import type { Profile, ProfileTab } from "../types";
import { ProfileInfoSection } from "./ProfileInfoSection";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { AddressSection } from "./AddressSection";
import { OrdersSection } from "./OrdersSection";
import { InvoicesSection } from "./InvoicesSection";
import { ProfileCouponsSection } from "./ProfileCouponsSection";
import { ProfileSkeleton } from "./skeletons/ProfileSkeleton";
import { cn } from "@/shared/utils/cn";

const tabs: { key: ProfileTab; icon: typeof User; labelKey: string }[] = [
  { key: "info", icon: User, labelKey: "tabs.info" },
  { key: "orders", icon: Package, labelKey: "tabs.orders" },
  { key: "invoices", icon: FileText, labelKey: "tabs.invoices" },
  { key: "addresses", icon: MapPin, labelKey: "tabs.addresses" },
  { key: "coupons", icon: Ticket, labelKey: "tabs.coupons" },
  { key: "security", icon: Lock, labelKey: "tabs.security" },
];

const isProfileTab = (value: string | null): value is ProfileTab =>
  tabs.some(({ key }) => key === value);

export function ProfileTabs() {
  const t = useTranslations("profile");
  const router = useRouter();
  const searchParams = useSearchParams();
  const setProfile = useAuthStore((s) => s.setProfile);
  const { isAuthenticated, sessionChecked } = useRequireAuth();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<ProfileTab>(() =>
    isProfileTab(tabParam) ? tabParam : "info",
  );
  const [prevTabParam, setPrevTabParam] = useState(tabParam);
  if (prevTabParam !== tabParam) {
    setPrevTabParam(tabParam);
    if (isProfileTab(tabParam)) {
      setActiveTab(tabParam);
    }
  }
  const [profile, setProfileData] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleTabChange = useCallback(
    (key: ProfileTab) => {
      setActiveTab(key);
      router.replace(
        { pathname: "/profile", query: key === "info" ? {} : { tab: key } },
        { scroll: false },
      );
    },
    [router],
  );

  useEffect(() => {
    if (!sessionChecked || !isAuthenticated) return;

    profileService.getProfile()
      .then((data) => {
        setProfileData(data);
        setProfile(data.id, data.name, data.image);
      })
      .catch((err) => setError(err instanceof Error ? err.message : t("loadError")))
      .finally(() => setLoading(false));
  }, [sessionChecked, isAuthenticated, setProfile, t]);

  if (!isAuthenticated) {
    return sessionChecked ? null : <ProfileSkeleton />;
  }

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
        <Loader2 className="mb-3 h-8 w-8 animate-spin text-error" />
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
            onClick={() => handleTabChange(key)}
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
      {activeTab === "invoices" && <InvoicesSection />}
      {activeTab === "addresses" && profile && <AddressSection customerId={profile.id} />}
      {activeTab === "coupons" && <ProfileCouponsSection />}
      {activeTab === "security" && <ChangePasswordForm />}
    </div>
  );
}

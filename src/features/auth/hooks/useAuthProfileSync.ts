"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { profileService } from "@/features/profile";
import { useAuthStore } from "../store/useAuthStore";

export function useAuthProfileSync() {
  const locale = useLocale();
  const token = useAuthStore((s) => s.token);
  const setEmailVerified = useAuthStore((s) => s.setEmailVerified);
  const setProfile = useAuthStore((s) => s.setProfile);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    profileService
      .getProfile(locale)
      .then((profile) => {
        if (cancelled) return;
        setEmailVerified(Boolean(profile.email_verified_at));
        setProfile(profile.id, profile.name, profile.image);
      })
      .catch(() => {
        // Keep current flags if the profile can't be fetched.
      });

    return () => {
      cancelled = true;
    };
  }, [token, locale, setEmailVerified, setProfile]);
}

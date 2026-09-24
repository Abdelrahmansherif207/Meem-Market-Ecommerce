"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { useAuthStore } from "@/features/auth";
import { profileService } from "../services/profileService";

/**
 * Auth→profile sync owned by the profile feature: watches the auth store and
 * refreshes the user's profile flags when a session becomes active.
 */
export function ProfileSyncHandler() {
  const locale = useLocale();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setEmailVerified = useAuthStore((s) => s.setEmailVerified);
  const setProfile = useAuthStore((s) => s.setProfile);
  const setEmail = useAuthStore((s) => s.setEmail);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    profileService
      .getProfile(locale)
      .then((profile) => {
        if (cancelled) return;
        setEmailVerified(Boolean(profile.email_verified_at));
        setProfile(profile.id, profile.name, profile.image);
        if (profile.email) setEmail(profile.email);
      })
      .catch(() => {
        // Keep current flags if the profile can't be fetched.
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, locale, setEmailVerified, setProfile, setEmail]);

  return null;
}

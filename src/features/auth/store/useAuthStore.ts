"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { logoutAction } from "../actions/session";
import { isSessionActive } from "../utils/sessionExpiration";
import type { SessionSnapshot } from "../types";

/** Pre-migration localStorage bearer token key, kept only to wipe leftovers. */
const LEGACY_TOKEN_STORAGE_KEY = "auth_token";

type AuthState = {
  id: number | null;
  permissions: string[];
  role: string[];
  emailVerified: boolean;
  isAuthenticated: boolean;
  email: string | null;
  phoneNumber: string | null;
  name: string | null;
  image: string | null;
  userId: number | null;
  expiresAt: string | null;
  loading: boolean;
  error: string | null;
  /** True once the server has confirmed whether the httpOnly session exists. */
  sessionChecked: boolean;
  setSession: (snapshot: SessionSnapshot) => boolean;
  setSessionChecked: (checked: boolean) => void;
  setProfile: (id: number | null, name: string | null, image: string | null) => void;
  setEmail: (email: string | null) => void;
  setEmailVerified: (verified: boolean) => void;
  clearAuth: () => void;
  logout: () => Promise<void>;
};

/** Removes any pre-migration localStorage bearer token left behind. */
function clearLegacyTokenStorage() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
}

const initialState = {
  id: null as number | null,
  permissions: [],
  role: [],
  emailVerified: false,
  isAuthenticated: false,
  email: null as string | null,
  phoneNumber: null as string | null,
  name: null as string | null,
  image: null as string | null,
  userId: null as number | null,
  loading: false,
  error: null as string | null,
  expiresAt: null as string | null,
  sessionChecked: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialState,
      setSessionChecked: (checked) => {
        set({ sessionChecked: checked });
      },
      setSession: (snapshot) => {
        const expiresAt = snapshot.expires_at ?? null;

        if (!isSessionActive(expiresAt)) {
          return false;
        }

        clearLegacyTokenStorage();
        set({
          ...initialState,
          id: snapshot.id ?? null,
          permissions: snapshot.permissions ?? [],
          role: snapshot.role ?? [],
          emailVerified: snapshot.email_verified ?? false,
          email: snapshot.email ?? null,
          phoneNumber: snapshot.phone_number ?? null,
          isAuthenticated: true,
          expiresAt,
          sessionChecked: true,
          error: null,
        });
        return true;
      },
      setProfile: (id, name, image) => {
        set({ userId: id, name, image });
      },
      setEmail: (email) => {
        set({ email });
      },
      setEmailVerified: (verified) => {
        set({ emailVerified: verified });
      },
      clearAuth: () => {
        clearLegacyTokenStorage();
        set({ ...initialState, sessionChecked: true });
      },
      logout: async () => {
        set({ loading: true, error: null });
        try {
          await logoutAction();
        } finally {
          clearLegacyTokenStorage();
          set({ ...initialState, sessionChecked: true });
        }
      },
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        id: state.id,
        permissions: state.permissions,
        role: state.role,
        emailVerified: state.emailVerified,
        isAuthenticated: state.isAuthenticated,
        email: state.email,
        phoneNumber: state.phoneNumber,
        name: state.name,
        image: state.image,
        userId: state.userId,
        expiresAt: state.expiresAt,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<AuthState>;
        clearLegacyTokenStorage();

        const hasValidSession =
          Boolean(persisted.isAuthenticated) && isSessionActive(persisted.expiresAt);

        if (!hasValidSession) {
          return { ...currentState, ...initialState };
        }

        return {
          ...currentState,
          ...persisted,
          expiresAt: persisted.expiresAt ?? null,
          isAuthenticated: true,
        };
      },
    },
  ),
);

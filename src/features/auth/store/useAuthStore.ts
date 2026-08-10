"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { AUTH_TOKEN_STORAGE_KEY } from "@/shared/constants/storageKeys";
import { authService } from "../services/authService";
import { isSessionActive } from "../utils/sessionExpiration";
import type { AuthLoginData, LoginPayload, RegisterPayload } from "../types";

type AuthState = {
  token: string | null;
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
  setAuthData: (authData: AuthLoginData) => boolean;
  setProfile: (id: number | null, name: string | null, image: string | null) => void;
  setEmailVerified: (verified: boolean) => void;
  clearAuth: () => void;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
};

function writeTokenToStorage(token: string | null) {
  if (typeof window === "undefined") return;

  if (!token) {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
}

const initialState = {
  token: null,
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
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,
      setAuthData: (authData) => {
        const currentState = get();
        const expiresAt =
          authData.expires_at ??
          (currentState.token === authData.token ? currentState.expiresAt : null);

        if (!authData.token || !isSessionActive(expiresAt)) {
          writeTokenToStorage(null);
          set({ ...initialState });
          return false;
        }

        writeTokenToStorage(authData.token);
        set({
          token: authData.token,
          id: authData.id ?? null,
          permissions: authData.permissions ?? [],
          role: authData.role ?? [],
          emailVerified: authData.email_verified ?? false,
          isAuthenticated: true,
          email: authData.email ?? null,
          phoneNumber: authData.phone_number ?? null,
          expiresAt,
          error: null,
        });
        return true;
      },
      setProfile: (id, name, image) => {
        set({ userId: id, name, image });
      },
      setEmailVerified: (verified) => {
        set({ emailVerified: verified });
      },
      clearAuth: () => {
        writeTokenToStorage(null);
        set({ ...initialState });
      },
      login: async (payload) => {
        set({ loading: true, error: null });
        try {
          const response = await authService.login(payload);
          if (!response.success) {
            throw new Error(response.message || "Unable to login.");
          }

          if (!get().setAuthData(response.data)) {
            throw new Error("The login response contained an invalid expiration date.");
          }
          set({ loading: false, error: null });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Login request failed.";
          set({ loading: false, error: message });
          throw error;
        }
      },
      register: async (payload) => {
        set({ loading: true, error: null });
        try {
          const response = await authService.register(payload);
          if (!response.success) {
            throw new Error(response.message || "Unable to register.");
          }

          const data = response.data as AuthLoginData;
          if (data?.token) {
            if (!get().setAuthData(data)) {
              throw new Error(
                "The registration response contained an invalid expiration date.",
              );
            }
            set({ loading: false, error: null });
            return;
          }

          set({ loading: false, error: null });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Register request failed.";
          set({ loading: false, error: message });
          throw error;
        }
      },
      logout: async () => {
        set({ loading: true, error: null });
        try {
          await authService.logout();
        } catch {
          // Token may be expired — still clear local state.
        } finally {
          writeTokenToStorage(null);
          set({ ...initialState });
        }
      },
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
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
        const hasValidSession =
          Boolean(persisted.token) && isSessionActive(persisted.expiresAt);

        if (!hasValidSession) {
          writeTokenToStorage(null);
          return { ...currentState, ...initialState };
        }

        writeTokenToStorage(persisted.token ?? null);
        return {
          ...currentState,
          ...persisted,
          token: persisted.token ?? null,
          expiresAt: persisted.expiresAt ?? null,
          isAuthenticated: true,
        };
      },
    },
  ),
);

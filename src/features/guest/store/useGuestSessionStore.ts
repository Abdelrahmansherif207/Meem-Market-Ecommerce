"use client";
import { create } from "zustand";
import { guestSessionService } from "../services/guestSessionService";

export type GuestSessionStatus = "idle" | "initializing" | "ready" | "failed";

type GuestSessionState = {
  status: GuestSessionStatus;
  /** Mirror of the backend CSRF token (same value as the csrf cookie). */
  csrfToken: string | null;
  expiresAt: string | null;
  /** Last init failure, kept so callers can surface the real cause. */
  lastError: unknown | null;
  /**
   * Idempotent: a single in-flight init is shared across callers, and a
   * ready session is never re-initialized. Failed attempts may be retried
   * by calling again.
   */
  ensureSession: (lang?: string) => Promise<void>;
  /** Clears local state after a revoke (or before a forced re-init). */
  reset: () => void;
};

// Module-level single-flight guard — zustand state alone cannot deduplicate
// concurrent `ensureSession` calls started in the same tick.
let inflight: Promise<void> | null = null;

export const useGuestSessionStore = create<GuestSessionState>((set, get) => ({
  status: "idle",
  csrfToken: null,
  expiresAt: null,
  lastError: null,

  ensureSession: (lang?: string) => {
    if (get().status === "ready") return Promise.resolve();
    if (inflight) return inflight;

    set({ status: "initializing" });
    inflight = guestSessionService
      .init(lang)
      .then((session) => {
        set({
          status: "ready",
          csrfToken: session.csrfToken,
          expiresAt: session.expiresAt,
          lastError: null,
        });
      })
      .catch((error) => {
        set({ status: "failed", csrfToken: null, expiresAt: null, lastError: error });
      })
      .finally(() => {
        inflight = null;
      });
    return inflight;
  },

  reset: () => {
    inflight = null;
    set({ status: "idle", csrfToken: null, expiresAt: null, lastError: null });
  },
}));

"use client";

import { create } from "zustand";

export type CartFeedback = {
  /** Monotonic id so repeat messages restart the toast timer. */
  id: number;
  title: string;
  message: string;
};

type CartFeedbackState = {
  feedback: CartFeedback | null;
  showFeedback: (feedback: { title: string; message: string }) => void;
  dismiss: () => void;
};

let feedbackSeq = 0;

/**
 * Lightweight, cross-surface feedback for cart mutations.
 *
 * Cart actions are fired from cards, PDP panels, sticky bars and bundles, so
 * failures are reported through one global toast instead of per-component
 * error state. Errors used to be swallowed with a bare `catch {}`, which made
 * rejected adds look like dead buttons.
 */
export const useCartFeedbackStore = create<CartFeedbackState>((set) => ({
  feedback: null,

  showFeedback: ({ title, message }) => {
    const trimmed = message.trim();
    if (!trimmed) return;
    set({ feedback: { id: ++feedbackSeq, title, message: trimmed } });
  },

  dismiss: () => set({ feedback: null }),
}));

/** Non-hook helper for callers that only need to surface a message. */
export function showCartFeedback(feedback: { title: string; message: string }) {
  useCartFeedbackStore.getState().showFeedback(feedback);
}

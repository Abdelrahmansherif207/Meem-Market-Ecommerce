import { create } from "zustand";
import type { NotificationItem } from "../types";

export interface ToastItem {
  id: string;
  notification: NotificationItem;
}

type ToastState = {
  toasts: ToastItem[];
  addToast: (notification: NotificationItem) => void;
  removeToast: (id: string) => void;
};

let toastSeq = 0;

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],

  addToast: (notification) => {
    const id = `${notification.id}-${++toastSeq}`;
    const item: ToastItem = { id, notification };
    set((state) => ({ toasts: [...state.toasts.slice(-2), item] }));
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export function pushToast(notification: NotificationItem) {
  useToastStore.getState().addToast(notification);
}
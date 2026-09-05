import { create } from "zustand";
import type { NotificationItem } from "../types";

type NotificationState = {
  notifications: NotificationItem[];
  unreadCount: number;
  page: number;
  lastPage: number;
  total: number;
  loading: boolean;
  initialLoading: boolean;
  error: string | null;
  setNotifications: (notifications: NotificationItem[]) => void;
  appendNotifications: (notifications: NotificationItem[]) => void;
  prependNotification: (notification: NotificationItem) => void;
  setPagination: (page: number, lastPage: number, total: number) => void;
  setUnreadCount: (count: number) => void;
  incrementUnread: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setInitialLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
};

const initialState = {
  notifications: [] as NotificationItem[],
  unreadCount: 0,
  page: 1,
  lastPage: 1,
  total: 0,
  loading: false,
  initialLoading: false,
  error: null as string | null,
};

export const useNotificationStore = create<NotificationState>()((set) => ({
  ...initialState,

  setNotifications: (notifications) => set({ notifications }),

  appendNotifications: (notifications) =>
    set((state) => ({
      notifications: [...state.notifications, ...notifications],
    })),

  prependNotification: (notification) =>
    set((state) => ({
      notifications: [
        notification,
        ...state.notifications.filter((n) => n.id !== notification.id),
      ],
    })),

  setPagination: (page, lastPage, total) => set({ page, lastPage, total }),

  setUnreadCount: (count) => set({ unreadCount: Math.max(0, count) }),

  incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),

  markAsRead: (id) =>
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id && !n.readAt
          ? { ...n, readAt: new Date().toISOString() }
          : n,
      );
      const marked = state.notifications.find((n) => n.id === id);
      return {
        notifications,
        unreadCount:
          marked && !marked.readAt
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
      };
    }),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.readAt ? n : { ...n, readAt: new Date().toISOString() },
      ),
      unreadCount: 0,
    })),

  removeNotification: (id) =>
    set((state) => {
      const target = state.notifications.find((n) => n.id === id);
      return {
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount:
          target && !target.readAt
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
      };
    }),

  setLoading: (loading) => set({ loading }),
  setInitialLoading: (initialLoading) => set({ initialLoading }),
  setError: (error) => set({ error }),
  reset: () => set({ ...initialState }),
}));
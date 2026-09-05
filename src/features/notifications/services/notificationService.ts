import { apiFetch } from "@/shared/lib/api";
import type { ApiResponse, PaginatedData } from "@/shared/types";
import { normalizeNotification } from "../utils";
import type { NotificationItem, RawNotification, RawNotificationListResponse } from "../types";

interface UnreadResponse {
  data: { count: number } | number;
}

export const notificationService = {
  list: async (page = 1, lang?: string): Promise<RawNotificationListResponse> => {
    const response = await apiFetch<ApiResponse<PaginatedData<RawNotification>>>(
      `/notifications?page=${page}`,
      { lang },
    );
    const raw = response.data as unknown as RawNotificationListResponse;
    return raw;
  },

  unread: async (lang?: string): Promise<number> => {
    const response = await apiFetch<ApiResponse<UnreadResponse["data"]>>(
      "/notifications/unread",
      { lang },
    );
    const data = response.data as unknown as UnreadResponse["data"];
    if (typeof data === "number") return data;
    return data?.count ?? 0;
  },

  markAsRead: async (id: string, lang?: string): Promise<void> => {
    await apiFetch<ApiResponse<unknown>>(`/notifications/${id}/read`, {
      method: "PATCH",
      lang,
    });
  },

  markAllAsRead: async (lang?: string): Promise<void> => {
    await apiFetch<ApiResponse<unknown>>("/notifications/read-all", {
      method: "PATCH",
      lang,
    });
  },

  delete: async (id: string, lang?: string): Promise<void> => {
    await apiFetch<ApiResponse<unknown>>(`/notifications/${id}`, {
      method: "DELETE",
      lang,
    });
  },
};

export function normalizeList(raw: RawNotificationListResponse, locale: string): NotificationItem[] {
  return raw.data.map((n) => normalizeNotification(n, locale));
}
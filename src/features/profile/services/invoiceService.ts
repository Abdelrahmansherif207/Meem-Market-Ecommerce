import { apiFetch } from "@/shared/lib/api";
import type { ApiResponse, PaginatedData } from "@/shared/types";
import type { InvoiceListItem, InvoiceDetail } from "../types";

export const invoiceService = {
  getAll: async (limit = 15, lang?: string): Promise<PaginatedData<InvoiceListItem>> => {
    const response = await apiFetch<ApiResponse<PaginatedData<InvoiceListItem>>>(
      `/general/invoices/my-invoices?limit=${limit}`,
      { lang },
    );
    return response.data;
  },

  getByUuid: async (uuid: string, lang?: string): Promise<InvoiceDetail> => {
    const response = await apiFetch<ApiResponse<InvoiceDetail>>(
      `/general/invoices/show/uuid/${uuid}`,
      { lang },
    );
    return response.data;
  },
};

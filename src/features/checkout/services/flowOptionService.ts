import { apiFetch } from "@/shared/lib/api";
import type { FlowOption, FlowOptionSource, LocalizedText } from "../types";
import { localizedText } from "../types";
import { governorateService } from "./governorateService";
import { pickupLocationService } from "@/features/pickup-location/services/pickupLocationService";

interface RawRecord {
  id: number;
  name?: string | LocalizedText | null;
  store_name?: string | LocalizedText | null;
  [key: string]: unknown;
}

interface RawListEnvelope {
  data?: RawRecord[] | { data?: RawRecord[] };
  [key: string]: unknown;
}

function toOption(record: RawRecord, locale: string): FlowOption {
  const nameSource = record.name ?? record.store_name ?? null;
  const name =
    typeof nameSource === "string" || nameSource == null
      ? ((nameSource as string | null) ?? "")
      : localizedText(nameSource as LocalizedText, locale);
  return { id: String(record.id), name };
}

async function fetchGeneralList(endpoint: string, lang?: string): Promise<RawRecord[]> {
  const body = await apiFetch<RawListEnvelope>(endpoint, { lang });
  if (Array.isArray(body?.data)) return body.data;
  if (body?.data && typeof body.data === "object" && Array.isArray((body.data as { data?: unknown }).data)) {
    return (body.data as { data: RawRecord[] }).data;
  }
  return [];
}

/**
 * Loads option records for a flow input's `source`. Values sent back to the
 * API are the record ids (as strings).
 */
export const flowOptionService = {
  load: async (source: FlowOptionSource, locale: string, lang?: string): Promise<FlowOption[]> => {
    switch (source) {
      case "countries": {
        const records = await fetchGeneralList("/general/countries", lang);
        return records.map((r) => toOption(r, locale));
      }
      case "warehouses": {
        const records = await fetchGeneralList("/general/warehouses", lang);
        return records.map((r) => toOption(r, locale));
      }
      case "governorates": {
        const records = await governorateService.getAll(lang);
        return records.map((g) => ({ id: String(g.id), name: String(g.name ?? "") }));
      }
      case "pickup_locations": {
        const records = await pickupLocationService.getAll(lang);
        return records.map((p) => ({ id: String(p.id), name: String(p.store_name ?? "") }));
      }
      default:
        return [];
    }
  },
};

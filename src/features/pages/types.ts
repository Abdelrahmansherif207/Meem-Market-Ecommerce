import type {
  HomeContentPage,
  HomePageSection,
} from "@/features/home/types";

export type { HomeContentPage, HomePageSection };

export interface PageRendererProps {
  page: HomeContentPage;
  locale: string;
}

export interface PageErrorProps {
  type: "not-found" | "network-error";
  locale?: string;
}

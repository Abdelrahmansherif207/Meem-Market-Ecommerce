export interface ApiResponse<T> {
  status: number;
  message: string;
  success: boolean;
  data: T;
}

export interface PaginatedData<T> {
  data: T[];
  links: {
    current_page: number;
    from: number | null;
    to: number | null;
    last_page: number;
    path: string;
    per_page: number;
    total: number;
    next_page_url: string | null;
    prev_page_url: string | null;
    last_page_url: string;
    first_page_url: string;
  };
  filters: unknown[];
  category: unknown | null;
}

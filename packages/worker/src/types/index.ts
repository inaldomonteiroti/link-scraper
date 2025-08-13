export interface ScrapeJob {
  pageId: number;
  url: string;
}

export interface ScrapeResult {
  title: string;
  finalUrl: string;
  links: Array<{ href: string; name: string | null }>;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

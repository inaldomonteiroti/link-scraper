declare module "@link-scraper/shared" {
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

  export interface UserResponse {
    id: number;
    username: string;
    email: string;
    createdAt: string;
  }

  export interface LinkResponse {
    id: number;
    href: string;
    name: string | null;
    createdAt: string;
  }

  export interface PageResponse {
    id: number;
    url: string;
    finalUrl?: string;
    title?: string;
    status: string;
    linkCount: number;
    queuedAt: string;
    startedAt?: string;
    finishedAt?: string;
    error?: string;
    createdAt: string;
  }

  export interface PagesResponse {
    pages: PageResponse[];
    pagination: Pagination;
  }

  export interface PageDetailsResponse {
    page: PageResponse;
    links: LinkResponse[];
    pagination: Pagination;
  }

  export interface AuthResponse {
    token: string;
    user: UserResponse;
  }

  export interface LoginCredentials {
    email: string;
    password: string;
  }

  export interface RegisterCredentials {
    username: string;
    email: string;
    password: string;
  }
}

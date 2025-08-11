// ===== Domain types (server/internal) =====
export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
}

export interface Page {
  id: number;
  userId: number;
  url: string;
  finalUrl?: string | null; // Added finalUrl field
  title: string | null;
  status: "queued" | "processing" | "done" | "failed";
  linkCount: number;
  queuedAt: Date;
  startedAt: Date | null;
  finishedAt: Date | null;
  error: string | null;
  createdAt: Date;
}

export interface Link {
  id: number;
  pageId: number;
  href: string;
  name: string | null;
  createdAt: Date;
}

// ===== API response / wire DTOs (frontend & network) =====
export interface UserResponse {
  id: number;
  username: string;
  email: string;
}

export interface PageResponse {
  id: number;
  url: string;
  finalUrl?: string | null; // Added finalUrl field
  title: string | null;
  status: "queued" | "processing" | "done" | "failed";
  linkCount: number;
  queuedAt: string; // ISO string
  startedAt: string | null;
  finishedAt: string | null;
  error: string | null;
  createdAt: string; // ISO string
}

export interface LinkResponse {
  id: number;
  href: string;
  name: string | null;
  createdAt: string; // ISO string
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

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
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

export interface ScrapeJob {
  pageId: number;
  url: string;
}
export interface ScrapeResult {
  title: string;
  links: Array<{ href: string; name: string | null }>;
  finalUrl?: string;
}

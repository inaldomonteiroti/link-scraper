// Frontend types
export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Page {
  id: number;
  url: string;
  finalUrl?: string | null;
  title: string | null;
  status: 'queued' | 'processing' | 'done' | 'failed';
  linkCount: number;
  queuedAt: Date;
  startedAt: Date | null;
  finishedAt: Date | null;
  error: string | null;
  createdAt: Date;
}

export interface Link {
  id: number;
  href: string;
  name: string | null;
  createdAt: Date;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

export interface PagesResponse {
  pages: Page[];
  pagination: Pagination;
}

export interface PageDetailsResponse {
  page: Page;
  links: Link[];
  pagination: Pagination;
}
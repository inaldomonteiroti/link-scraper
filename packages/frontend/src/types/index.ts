export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
}

export interface Page {
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

export interface Link {
  id: number;
  href: string;
  name: string | null;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
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

export interface AuthResponse {
  token: string;
  user: User;
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

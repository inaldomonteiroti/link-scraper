import axios, { AxiosHeaders } from "axios";
import {
  AuthResponse,
  Page,
  PagesResponse,
  PageDetailsResponse,
} from "../types";

// Get environment variables with fallbacks
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";
const API_TIMEOUT = parseInt(process.env.REACT_APP_API_TIMEOUT || "30000", 10);
const TOKEN_KEY = "token"; // Use the same key as AuthContext

const api = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: { "Content-Type": "application/json" },
});

// Add authentication token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    console.log("Adding token to request:", token.substring(0, 10) + "...");
    const h = config.headers as AxiosHeaders | undefined;
    if (h && typeof h.set === "function") {
      h.set("Authorization", `Bearer ${token}`);
    } else {
      config.headers = {
        ...(config.headers || {}),
        Authorization: `Bearer ${token}`,
      } as unknown as AxiosHeaders;
    }
  } else {
    console.log("No token found in localStorage");
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log errors in development mode
    if (process.env.NODE_ENV === "development") {
      console.error("API Error:", error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (username: string, email: string, password: string) =>
    api.post<{ message: string } & AuthResponse>("/auth/register", {
      username,
      email,
      password,
    }),

  login: (email: string, password: string) =>
    api.post<{ message: string } & AuthResponse>("/auth/login", {
      email,
      password,
    }),

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    return Promise.resolve();
  },
};

export const pagesAPI = {
  submitUrl: (url: string) =>
    api.post<{ message: string; page: Page }>("/pages", { url }),

  getPages: (page = 1, limit = 10) =>
    api.get<PagesResponse>(`/pages?page=${page}&limit=${limit}`),

  getPageDetails: (id: number, page = 1, limit = 20) =>
    api.get<PageDetailsResponse>(`/pages/${id}?page=${page}&limit=${limit}`),
};

export default api;

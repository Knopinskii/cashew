import axios from "axios";
import type { AxiosError, AxiosRequestConfig } from "axios";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "./tokens";

const API_URL = import.meta.env.VITE_API_URL;
// VITE_API_URL may or may not end in a slash, and the refresh call builds its
// URL by hand rather than going through the client's baseURL.
const API_ROOT = (API_URL ?? "").replace(/\/+$/, "");

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `JWT ${token}`;
  }
  return config;
});

/** Requests whose own 401 means "wrong credentials", not "token expired".
 *  Trying to refresh on these would loop. */
const AUTH_ENDPOINTS = ["/api/auth/jwt/create/", "/api/auth/jwt/refresh/"];

/** In flight refresh, shared by everything that got a 401 at the same moment.
 *  The dashboard fires two requests at once, and without this each would start
 *  its own refresh and the slower answer would overwrite the faster one. */
let refreshInFlight: Promise<string> | null = null;

function refreshAccessToken(): Promise<string> {
  const refresh = getRefreshToken();
  if (!refresh) return Promise.reject(new Error("no refresh token"));

  // Deliberately a bare axios call: going through apiClient would send this
  // request back through the interceptor below and recurse on its own failure.
  return axios
    .post<{ access: string }>(`${API_ROOT}/api/auth/jwt/refresh/`, { refresh })
    .then(({ data }) => {
      setTokens(data.access);
      return data.access;
    });
}

type RetriableConfig = AxiosRequestConfig & { _retried?: boolean };

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const isAuthCall = AUTH_ENDPOINTS.some((url) => original?.url?.includes(url));

    if (
      error.response?.status !== 401 ||
      !original ||
      original._retried ||
      isAuthCall
    ) {
      return Promise.reject(error);
    }

    original._retried = true;

    try {
      refreshInFlight =
        refreshInFlight ??
        refreshAccessToken().finally(() => {
          refreshInFlight = null;
        });
      const access = await refreshInFlight;
      original.headers = { ...original.headers, Authorization: `JWT ${access}` };
      return apiClient(original);
    } catch {
      // The refresh token is gone or expired too: this is a real sign out.
      clearTokens();
      window.location.href = "/login";
      return Promise.reject(error);
    }
  },
);

export async function apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await apiClient(config);
  return response.data;
}

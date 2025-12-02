import axios from "axios";
import { storage } from "../utils/storage";
import { API_URL, STORAGE_KEYS } from "~/constants";

// Create generic Axios instance
export const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach Access Token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = storage.get(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Handle 401 and Token Refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 (Unauthorized) and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = storage.get(STORAGE_KEYS.REFRESH_TOKEN);

      if (!refreshToken) {
        handleLogout();
        return Promise.reject(error);
      }

      try {
        // Direct call to refresh endpoint to avoid interceptor loops
        const { data } = await axios.post(`${API_URL}/auth/refresh-tokens`, {
          refreshToken,
          agent:
            typeof navigator !== "undefined"
              ? navigator.userAgent
              : "Orval-Client",
        });

        // Save new tokens
        storage.set(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
        storage.set(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken.token);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        handleLogout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// Helper to clean up and redirect
function handleLogout() {
  storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
  storage.remove(STORAGE_KEYS.REFRESH_TOKEN);

  if (typeof window !== "undefined") {
    // Ideally, use a router navigation here, but window.location is safer for pure axios file
    window.location.href = "/auth/login";
  }
}

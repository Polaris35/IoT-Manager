// app/api/client.ts
import axios from "axios";
import type { AxiosRequestConfig } from "axios";

// 1. FIX: Временно хардкодим URL, чтобы Orval (Node.js) не ругался на import.meta
// Позже мы решим это через process.env или dotenv, но сейчас нам нужна генерация.
export const API_URL = "http://localhost:3000";

// 2. Создаем инстанс axios
export const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// === Хранилище токенов ===
const ACCESS_TOKEN_KEY = "iot_access_token";
const REFRESH_TOKEN_KEY = "iot_refresh_token";

// Безопасный доступ к localStorage (чтобы не падало в Node.js)
const storage = {
  get: (key: string) =>
    typeof window !== "undefined" ? localStorage.getItem(key) : null,
  set: (key: string, value: string) => {
    if (typeof window !== "undefined") localStorage.setItem(key, value);
  },
  remove: (key: string) => {
    if (typeof window !== "undefined") localStorage.removeItem(key);
  },
};

// 3. Интерцепторы
axiosInstance.interceptors.request.use(
  (config) => {
    const token = storage.get(ACCESS_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = storage.get(REFRESH_TOKEN_KEY);

      if (!refreshToken) {
        storage.remove(ACCESS_TOKEN_KEY);
        storage.remove(REFRESH_TOKEN_KEY);
        // Редирект только в браузере
        if (typeof window !== "undefined") window.location.href = "/auth/login";
        return Promise.reject(error);
      }

      try {
        // Используем axios напрямую для рефреша
        const { data } = await axios.post(`${API_URL}/auth/refresh-tokens`, {
          refreshToken,
          agent:
            typeof navigator !== "undefined"
              ? navigator.userAgent
              : "Orval-Client",
        });

        storage.set(ACCESS_TOKEN_KEY, data.accessToken);
        storage.set(REFRESH_TOKEN_KEY, data.refreshToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        storage.remove(ACCESS_TOKEN_KEY);
        storage.remove(REFRESH_TOKEN_KEY);
        if (typeof window !== "undefined") window.location.href = "/auth/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

// 4. FIX: Создаем функцию-мутатор для Orval
// Orval ожидает функцию, которая принимает конфиг и возвращает Promise<T>
// Мы используем наш настроенный axiosInstance внутри.
export const apiClient = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  const source = axios.CancelToken.source();

  const promise = axiosInstance({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-ignore
  promise.cancel = () => {
    source.cancel("Query was cancelled");
  };

  return promise;
};

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "iot_access_token",
  REFRESH_TOKEN: "iot_refresh_token",
} as const;

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

import type { AxiosRequestConfig } from "axios";
import axios from "axios"; // Import pure axios only for CancelToken
import { axiosInstance } from "./axios";

/**
 * Custom Mutator for Orval
 * Wraps the configured axios instance and handles cancellation.
 */
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

  // @ts-ignore: Adding cancel method to promise for Orval compatibility
  promise.cancel = () => {
    source.cancel("Query was cancelled");
  };

  return promise;
};

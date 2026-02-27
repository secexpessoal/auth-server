import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../../store/auth.store";
import toast from "react-hot-toast";
import { getErrorMessage } from "../api-error/api-error.util";
import type { DataObjectError } from "../../modules/auth/molecule/auth.types";

export const axiosClient = axios.create({
  baseURL: "",
  withCredentials: true,
});

axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<DataObjectError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    const { status, data } = error.response || {};

    if (status === 403 && data?.error === "PASSWORD_RESET_REQUIRED") {
      return Promise.reject(error);
    }

    if (status === 401) {
      const isAuthEndpoint = originalRequest?.url?.includes("/login") || originalRequest?.url?.includes("/refresh");

      if (isAuthEndpoint || originalRequest?._retry) {
        useAuthStore.getState().clearAuth();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post("/v1/user/refresh", {}, { withCredentials: true });
        const newUser = response.data.metadata;
        const newToken = response.data.token;

        if (!newToken) throw new Error("Refresh failed");

        useAuthStore.getState().setAuth(newToken, newUser, response.data.password_reset_required);
        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);

        useAuthStore.getState().clearAuth();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (status === 403) {
      toast.error(getErrorMessage(error, "Você não tem permissão para realizar esta ação."));
    }

    return Promise.reject(error);
  },
);

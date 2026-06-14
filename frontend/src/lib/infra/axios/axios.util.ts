import axios from "axios";
import type { InternalAxiosRequestConfig, AxiosError } from "axios";
import { useAuthStore } from "@lib/store/auth.store";
import { toastApiError, toastValidationFieldErrors } from "@lib/utils/api-error/api-error.util";
import type { DataObjectError, UserResponseDto, UserSessionResponseDto } from "@lib/data/auth/molecule/auth.types";

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

    if (status === 403 && data?.error === "passwordResetRequired") {
      return Promise.reject(error);
    }

    if (status === 400 || status === 422) {
      if (
        toastValidationFieldErrors(error, {
          username: "Nome completo",
          email: "E-mail",
          password: "Senha",
          oldPassword: "Senha atual",
          newPassword: "Nova senha",
          registration: "Matrícula",
          position: "Cargo",
          workRegime: "Regime de trabalho",
          roles: "Permissões",
          role: "Cargo",
          name: "Nome do cargo",
          positionId: "Cargo",
          eventType: "Tipo de evento",
          reason: "Motivo",
          endDate: "Data final",
          "inPersonWorkPeriod.frequencyCycleWeeks": "Ciclo de repetição",
          "inPersonWorkPeriod.frequencyWeekMask": "Dias presenciais",
          "inPersonWorkPeriod.frequencyDurationDays": "Dias consecutivos",
        })
      ) {
        return Promise.reject(error);
      }
    }

    if (status === 401) {
      const isAuthEndpoint = 
        originalRequest?.url?.includes("/login") || 
        originalRequest?.url?.includes("/refresh") || 
        originalRequest?.url?.includes("/user-reset");

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
        const response = await axios.post<{ session: UserSessionResponseDto; user: UserResponseDto }>(
          "/v2/user/refresh",
          {},
          { withCredentials: true },
        );
        const { session, user } = response.data;

        if (!session?.accessToken) throw new Error("Refresh failed");

        useAuthStore.getState().setAuth(session, user);
        processQueue(null, session.accessToken);

        originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;
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
      toastApiError(error, "Você não tem permissão para realizar esta ação.");
    }

    if (status && status >= 400 && status !== 401 && status !== 403) {
      if (status >= 500 || status === 404) {
        const searchParams = new URLSearchParams();
        searchParams.set("error_code", status.toString());
        window.location.href = `/?${searchParams.toString()}`;
      }
    }

    return Promise.reject(error);
  },
);

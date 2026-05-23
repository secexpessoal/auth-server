import { create } from "zustand";
import { persist, createJSONStorage, subscribeWithSelector } from "zustand/middleware";
import type { UserResponseDto, UserSessionResponseDto } from "@lib/data/auth/molecule/auth.types";
import axios from "axios";

type AuthState = {
  token: string | null;
  user: UserResponseDto | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  passwordResetRequired: boolean;
  isInitializing: boolean;
  setAuth: (session: UserSessionResponseDto, user: UserResponseDto) => void;
  clearAuth: () => void;
  initializeAuth: () => Promise<void>;
};

let refreshInterval: number | undefined;

const proactiveRefresh = async () => {
  try {
    const response = await axios.post<{
      session: UserSessionResponseDto;
      user: UserResponseDto;
    }>(
      "/v1/user/refresh",
      {},
      {
        withCredentials: true,
      },
    );
    if (response.data.session && response.data.user) {
      useAuthStore.getState().setAuth(response.data.session, response.data.user);
    }
  } catch (_error) {
    console.error("Proactive refresh failed", _error);
    useAuthStore.getState().clearAuth();
  }
};

const fetchProfile = async () => {
  const response = await axios.get<UserResponseDto>("/v1/user/profile", {
    withCredentials: true,
  });
  return response.data;
};

export const useAuthStore = create<AuthState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        token: null,
        user: null,
        isAuthenticated: false,
        isAdmin: false,
        passwordResetRequired: false,
        isInitializing: true,

        initializeAuth: async () => {
          // Se já estamos autenticados via persistência, só removemos o loading
          if (get().isAuthenticated) {
            set({ isInitializing: false });
            return;
          }

          try {
            // Se não estamos autenticados na memória, tentamos buscar o perfil (usa o cookie access_token)
            const user = await fetchProfile();
            // Se funcionou, significa que o cookie é válido! Reconstruímos a sessão parcial
            set({
              user,
              isAuthenticated: true,
              isAdmin: user.roles.includes("ROLE_ADMIN"),
              isInitializing: false,
            });
          } catch (_error) {
            // Se falhou (401), tentamos o refresh silencioso
            try {
              const refreshResponse = await axios.post<{
                session: UserSessionResponseDto;
                user: UserResponseDto;
              }>("/v1/user/refresh", {}, { withCredentials: true });
              
              get().setAuth(refreshResponse.data.session, refreshResponse.data.user);
            } catch (_refreshError) {
              console.warn("Sessão expirada ou inexistente");
              get().clearAuth();
            } finally {
              set({ isInitializing: false });
            }
          }
        },

        setAuth: (session, user) => {
          set({
            token: session.accessToken,
            user,
            isAuthenticated: true,
            passwordResetRequired: session.passwordResetRequired,
            isAdmin: user.roles.includes("ROLE_ADMIN"),
          });

          if (refreshInterval) {
            window.clearInterval(refreshInterval);
          }

          refreshInterval = window.setInterval(proactiveRefresh, 9 * 60 * 1000);
        },

        clearAuth: () => {
          if (refreshInterval) {
            window.clearInterval(refreshInterval);
            refreshInterval = undefined;
          }
          set({
            user: null,
            token: null,
            isAdmin: false,
            isAuthenticated: false,
            passwordResetRequired: false,
            isInitializing: false,
          });
        },
      }),
      {
        name: "auth-storage",
        storage: createJSONStorage(() => localStorage),
        onRehydrateStorage: () => (state) => {
          // Se sobrevivermos a um F5 e formos autenticados, precisamos registrar novamente o intervalo de atualização do token.
          if (state?.isAuthenticated) {
            if (refreshInterval) {
              window.clearInterval(refreshInterval);
            }

            refreshInterval = window.setInterval(proactiveRefresh, 9 * 60 * 1000);
          }
        },
      },
    ),
  ),
);

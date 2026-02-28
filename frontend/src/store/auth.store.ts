  import { create } from "zustand";
import { persist, createJSONStorage, subscribeWithSelector } from "zustand/middleware";
import type { UserResponseDto, UserSessionResponseDto } from "../modules/auth/molecule/auth.types";
import axios from "axios";

type AuthState = {
  token: string | null;
  user: UserResponseDto | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  passwordResetRequired: boolean;
  setAuth: (session: UserSessionResponseDto, user: UserResponseDto) => void;
  clearAuth: () => void;
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
  } catch (error) {
    console.error("Proactive refresh failed", error);
    useAuthStore.getState().clearAuth();
  }
};

export const useAuthStore = create<AuthState>()(
  subscribeWithSelector(
    persist(
      (set) => ({
        token: null,
        user: null,
        isAuthenticated: false,
        isAdmin: false,
        passwordResetRequired: false,

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
          });
        },
      }),
      {
        name: "auth-storage",
        storage: createJSONStorage(() => sessionStorage),
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

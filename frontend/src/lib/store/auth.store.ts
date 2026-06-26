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
  profileSetupRequired: boolean;
  isInitializing: boolean;
  setAuth: (session: UserSessionResponseDto, user: UserResponseDto) => void;
  completePasswordReset: () => void;
  completeProfileSetup: (user: UserResponseDto) => void;
  clearAuth: () => void;
  initializeAuth: () => Promise<void>;
};

let refreshInterval: number | undefined;
let initializationPromise: Promise<void> | undefined;

const isProfileSetupMissing = (user: UserResponseDto | null) => {
  const profile = user?.profile;

  return (
    !profile ||
    !profile.username?.trim() ||
    !profile.registration?.trim() ||
    !profile.position
  );
};

const proactiveRefresh = async () => {
  try {
    const response = await axios.post<{
      session: UserSessionResponseDto;
      user: UserResponseDto;
    }>(
      "/v2/user/refresh",
      {},
      {
        withCredentials: true,
      },
    );
    if (response.data.session && response.data.user) {
      useAuthStore.getState().setAuth(response.data.session, response.data.user);
    }
  } catch {
    useAuthStore.getState().clearAuth();
  }
};

const startProactiveRefresh = () => {
  if (refreshInterval) {
    window.clearInterval(refreshInterval);
  }

  refreshInterval = window.setInterval(proactiveRefresh, 9 * 60 * 1000);
};

const stopProactiveRefresh = () => {
  if (refreshInterval) {
    window.clearInterval(refreshInterval);
    refreshInterval = undefined;
  }
};

const fetchProfile = async (token?: string | null) => {
  const response = await axios.get<UserResponseDto>("/v2/user/profile", {
    withCredentials: true,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
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
        profileSetupRequired: false,
        isInitializing: true,

        initializeAuth: async () => {
          if (initializationPromise) return initializationPromise;

          initializationPromise = (async () => {
            const { isAuthenticated, token } = get();

            // Se não há sessão persistida, não há nada a inicializar.
            if (!isAuthenticated && !token) {
              set({ isInitializing: false });
              return;
            }

            try {
              const user = await fetchProfile(token);
              set({
                user,
                isAuthenticated: true,
                isAdmin: user.roles.includes("ROLE_ADMIN"),
                isInitializing: false,
                passwordResetRequired: false,
                profileSetupRequired: isProfileSetupMissing(user),
              });
              startProactiveRefresh();
            } catch {
              // O /profile falhou (access token expirado ou inválido).
              // Só tenta o refresh se havia uma sessão autenticada persistida.
              if (!isAuthenticated) {
                get().clearAuth();
                return;
              }

              try {
                const refreshResponse = await axios.post<{
                  session: UserSessionResponseDto;
                  user: UserResponseDto;
                }>("/v2/user/refresh", {}, { withCredentials: true });

                get().setAuth(refreshResponse.data.session, refreshResponse.data.user);
              } catch {
                get().clearAuth();
              } finally {
                set({ isInitializing: false });
              }
            }
          })().finally(() => {
            initializationPromise = undefined;
          });

          return initializationPromise;
        },

        setAuth: (session, user) => {
          set({
            token: session.accessToken,
            user,
            isAuthenticated: true,
            passwordResetRequired: session.passwordResetRequired,
            profileSetupRequired: session.profileSetupRequired,
            isAdmin: user.roles.includes("ROLE_ADMIN"),
          });
          startProactiveRefresh();
        },

        completePasswordReset: () => {
          set({ passwordResetRequired: false });
        },

        completeProfileSetup: (user) => {
          set({
            user,
            profileSetupRequired: false,
            isAdmin: user.roles.includes("ROLE_ADMIN"),
          });
        },

        clearAuth: () => {
          stopProactiveRefresh();
          set({
            user: null,
            token: null,
            isAdmin: false,
            isAuthenticated: false,
            passwordResetRequired: false,
            profileSetupRequired: false,
            isInitializing: false,
          });
        },
      }),
      {
        name: "auth-storage",
        storage: createJSONStorage(() => sessionStorage),
        partialize: (state) => ({
          token: state.token,
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          isAdmin: state.isAdmin,
          passwordResetRequired: state.passwordResetRequired,
          profileSetupRequired: state.profileSetupRequired,
        }),
        onRehydrateStorage: () => (state) => {
          // Se sobrevivermos a um F5 e formos autenticados, precisamos registrar novamente o intervalo de atualização do token.
          if (state?.isAuthenticated) {
            startProactiveRefresh();
          }
        },
      },
    ),
  ),
);

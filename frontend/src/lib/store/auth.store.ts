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
  } catch (_error) {
    console.error("Proactive refresh failed", _error);
    useAuthStore.getState().clearAuth();
  }
};

const fetchProfile = async () => {
  const response = await axios.get<UserResponseDto>("/v2/user/profile", {
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
        profileSetupRequired: false,
        isInitializing: true,

        initializeAuth: async () => {
          console.log("[initializeAuth] called, isAuthenticated:", get().isAuthenticated, "profileSetupRequired:", get().profileSetupRequired);
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
              passwordResetRequired: false, // Perfil V2 não traz essa flag diretamente no objeto user, mas a sessão reconstruída assume false por padrão
              profileSetupRequired: isProfileSetupMissing(user),
            });
          } catch (_error) {
            // Se falhou (401), tentamos o refresh silencioso
            try {
              const refreshResponse = await axios.post<{
                session: UserSessionResponseDto;
                user: UserResponseDto;
              }>("/v2/user/refresh", {}, { withCredentials: true });
              
              get().setAuth(refreshResponse.data.session, refreshResponse.data.user);
            } catch (_refreshError) {
              // Somente logamos se não for 401 (que é o esperado para quem não está logado)
              if (axios.isAxiosError(_refreshError) && _refreshError.response?.status !== 401) {
                console.warn("Falha ao tentar renovar sessão:", _refreshError.message);
              }
              get().clearAuth();
            } finally {
              set({ isInitializing: false });
            }
          }
        },

        setAuth: (session, user) => {
          console.log("[setAuth] input profileSetupRequired:", session.profileSetupRequired);
          console.log("[setAuth] sessionStorage before:", JSON.parse(sessionStorage.getItem("auth-storage") || "{}")?.state?.profileSetupRequired);
          set({
            token: session.accessToken,
            user,
            isAuthenticated: true,
            passwordResetRequired: session.passwordResetRequired,
            profileSetupRequired: session.profileSetupRequired,
            isAdmin: user.roles.includes("ROLE_ADMIN"),
          });
          console.log("[setAuth] get() after set:", get().profileSetupRequired);
          console.log("[setAuth] sessionStorage after:", JSON.parse(sessionStorage.getItem("auth-storage") || "{}")?.state?.profileSetupRequired);

          if (refreshInterval) {
            window.clearInterval(refreshInterval);
          }

          refreshInterval = window.setInterval(proactiveRefresh, 9 * 60 * 1000);
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

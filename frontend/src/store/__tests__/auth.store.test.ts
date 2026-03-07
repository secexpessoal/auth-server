import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "@store/auth.store";

describe("Auth Store (Zustand)", () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
  });

  it("Deve inicializar com os estados padrão nulos/falsos", () => {
    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isAdmin).toBe(false);
  });

  it("Deve reconhecer usuário ADMIN corretamente", () => {
    useAuthStore.getState().setAuth(
      { accessToken: "token_mock_123", tokenVersion: 2, passwordResetRequired: false },
      {
        id: "dummy-id-admin",
        email: "admin@ok.com",
        active: true,
        roles: ["ROLE_ADMIN"],
        profile: {
          username: "admin_user",
          registration: "123456",
          position: "Admin",
          birthDate: null,
          workRegime: "HYBRID",
          livesElsewhere: false,
          inPersonWorkPeriod: null,
        },
        audit: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          updatedBy: "system",
        },
      },
    );

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.isAdmin).toBe(true);
    expect(state.token).toBe("token_mock_123");
  });

  it("Deve reconhecer usuário comum corretamente rejeitando admin", () => {
    useAuthStore.getState().setAuth(
      { accessToken: "token_mock_123", tokenVersion: 2, passwordResetRequired: false },
      {
        id: "dummy-id-user",
        email: "user@ok.com",
        active: true,
        roles: ["ROLE_USER"],
        profile: {
          username: "common_user",
          registration: "654321",
          position: "User",
          birthDate: null,
          workRegime: "HYBRID",
          livesElsewhere: false,
          inPersonWorkPeriod: null,
        },
        audit: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          updatedBy: "system",
        },
      },
    );

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.isAdmin).toBe(false);
  });

  it("Deve limpar os dados ao executar clearAuth", () => {
    useAuthStore.getState().setAuth(
      { accessToken: "token_mock_123", tokenVersion: 2, passwordResetRequired: false },
      {
        id: "dummy-id",
        email: "admin@ok.com",
        active: true,
        roles: ["ROLE_ADMIN"],
        profile: {
          username: "admin_user",
          registration: "123456",
          position: "Admin",
          birthDate: null,
          workRegime: "HYBRID",
          livesElsewhere: false,
          inPersonWorkPeriod: null,
        },
        audit: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          updatedBy: "system",
        },
      },
    );

    useAuthStore.getState().clearAuth();
    const state = useAuthStore.getState();

    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isAdmin).toBe(false);
  });
});

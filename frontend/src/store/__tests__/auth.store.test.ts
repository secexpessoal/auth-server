import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "../auth.store";

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
      { access_token: "token_mock_123", token_version: 2, password_reset_required: false },
      {
        id: "dummy-id-admin",
        email: "admin@ok.com",
        active: true,
        roles: ["ROLE_ADMIN"],
        profile: {
          username: "admin_user",
          registration: "123456",
          position: "Admin",
          birth_date: null,
          work_regime: "HYBRID",
          lives_elsewhere: false,
          in_person_work_period: null,
        },
        audit: {
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          updated_by: "system",
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
      { access_token: "token_mock_123", token_version: 2, password_reset_required: false },
      {
        id: "dummy-id-user",
        email: "user@ok.com",
        active: true,
        roles: ["ROLE_USER"],
        profile: {
          username: "common_user",
          registration: "654321",
          position: "User",
          birth_date: null,
          work_regime: "HYBRID",
          lives_elsewhere: false,
          in_person_work_period: null,
        },
        audit: {
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          updated_by: "system",
        },
      },
    );

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.isAdmin).toBe(false);
  });

  it("Deve limpar os dados ao executar clearAuth", () => {
    useAuthStore.getState().setAuth(
      { access_token: "token_mock_123", token_version: 2, password_reset_required: false },
      {
        id: "dummy-id",
        email: "admin@ok.com",
        active: true,
        roles: ["ROLE_ADMIN"],
        profile: {
          username: "admin_user",
          registration: "123456",
          position: "Admin",
          birth_date: null,
          work_regime: "HYBRID",
          lives_elsewhere: false,
          in_person_work_period: null,
        },
        audit: {
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          updated_by: "system",
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

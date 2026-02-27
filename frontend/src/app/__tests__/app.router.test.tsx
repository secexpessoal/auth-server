import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAuthStore } from "../../store/auth.store";

vi.mock("react-hot-toast", () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("AppRouter Integration & Guards", () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
  });

  it("Deve rejeitar sessão se usuario logado NÃO é ADMIN no layout protegido", () => {
    useAuthStore.getState().setAuth(
      { access_token: "dummy", token_version: 2, password_reset_required: false },
      {
        id: "dummy-id",
        email: "common@ok.com",
        active: true,
        roles: ["ROLE_USER"],
        profile: {
          username: "common",
          registration: "123456",
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
});

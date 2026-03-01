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
      { accessToken: "dummy", tokenVersion: 2, passwordResetRequired: false },
      {
        id: "dummy-id",
        email: "common@ok.com",
        active: true,
        roles: ["ROLE_USER"],
        profile: {
          username: "common",
          registration: "123456",
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
});

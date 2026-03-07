import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { axiosClient } from "@lib/axios/axios.util";
import { loginAttempt, logoutAttempt } from "@modules/auth/services/auth.service";

// Mock axios
vi.mock("@lib/axios/axios.util", () => ({
  axiosClient: {
    post: vi.fn(),
  },
}));

describe("auth.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loginAttempt should call axios post with correct params", async () => {
    const mockResponse = {
      data: {
        session: {
          accessToken: "token123",
          tokenVersion: 2,
          passwordResetRequired: false,
        },
        user: {
          id: "1",
          email: "test@test.com",
          active: true,
          roles: ["ROLE_ADMIN"],
          profile: {
            username: "testuser",
            registration: "123456",
            position: "Software Engineer",
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
      },
    };
    (axiosClient.post as Mock).mockResolvedValue(mockResponse);

    const result = await loginAttempt({ email: "test@test.com", password: "password" });

    expect(axiosClient.post).toHaveBeenCalledWith("/v1/user/login", {
      email: "test@test.com",
      password: "password",
    });
    expect(result).toEqual(mockResponse.data);
  });

  it("logoutAttempt should call axios post", async () => {
    (axiosClient.post as Mock).mockResolvedValue({});
    await logoutAttempt();
    expect(axiosClient.post).toHaveBeenCalledWith("/v1/user/logout");
  });
});

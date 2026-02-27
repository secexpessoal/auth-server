import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { axiosClient } from "@lib/axios/axios.util";
import { loginAttempt, logoutAttempt } from "../services/auth.service";

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
          access_token: "token123",
          token_version: 2,
          password_reset_required: false,
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

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
        token: "token123",
        password_reset_required: false,
        metadata: {
          id: "1",
          email: "test@test.com",
          username: "testuser",
          role: "ADMIN",
          active: true,
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

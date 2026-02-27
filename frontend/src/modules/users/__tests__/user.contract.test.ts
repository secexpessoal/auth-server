import { describe, it, expect } from "vitest";
import { registerAdminSchema } from "@modules/users/molecule/user.schema";
import { loginSchema } from "@modules/auth/molecule/auth.schema";
import { mockLoginResponseAdmin } from "@fixtures/auth.fixture";

describe("API Contract Validation", () => {
  describe("auth.types.ts Contract", () => {
    it("Should correctly map all fields of AuthenticationResponseDto", () => {
      // If the signature changes in the backend, this test (and TS compiler) will catch it if we update the fixture
      expect(mockLoginResponseAdmin).toHaveProperty("token");
      expect(mockLoginResponseAdmin).toHaveProperty("password_reset_required");
      expect(mockLoginResponseAdmin).toHaveProperty("metadata");

      expect(mockLoginResponseAdmin.metadata).toHaveProperty("id");
      expect(mockLoginResponseAdmin.metadata).toHaveProperty("username");
      expect(mockLoginResponseAdmin.metadata).toHaveProperty("email");
      expect(mockLoginResponseAdmin.metadata).toHaveProperty("role");
      expect(mockLoginResponseAdmin.metadata).toHaveProperty("active");
    });
  });

  describe("Zod Schemas vs AuthenticationRequestDto Contract", () => {
    it("loginSchema deve exigir os exatos campos que AuthenticationRequestDto.java exige", () => {
      const validPayload = {
        email: "test@ok.com",
        password: "securePassword123",
      };

      const result = loginSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it("loginSchema deve rejeitar email inválido conforme backend exige", () => {
      const invalidPayload = {
        email: "invalid-email",
        password: "securePassword123",
      };

      const result = loginSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });

  describe("Zod Schemas vs RegisterRequestDto Contract", () => {
    it("registerAdminSchema deve exigir username(3-30) e email valido", () => {
      const validPayload = {
        email: "admin@ok.com",
        username: "admin_test",
      };

      const result = registerAdminSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it("registerAdminSchema deve rejeitar username menor que 3 (conforme size(min=3) no java)", () => {
      const invalidPayload = {
        username: "ab",
        email: "admin@ok.com",
      };

      const result = registerAdminSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });
});

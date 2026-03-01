import type { AuthenticationResponseDto, UserResponseDto } from "../modules/auth/molecule/auth.types";

export const mockAdminUser: UserResponseDto = {
  id: "019c9cf6-ff7d-7cd0-9050-fc0a6d4c3689",
  email: "admin@ok.com",
  roles: ["ROLE_ADMIN"],
  active: true,
  profile: {
    username: "admin_test",
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
};

export const mockCommonUser: UserResponseDto = {
  id: "019c9cf6-ff7d-7cd0-9050-fc0a6d4c3690",
  email: "user@ok.com",
  roles: ["ROLE_USER"],
  active: true,
  profile: {
    username: "common_test",
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
};

export const mockLoginResponseAdmin: AuthenticationResponseDto = {
  session: {
    accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mocked_admin_token",
    tokenVersion: 2,
    passwordResetRequired: false,
  },
  user: mockAdminUser,
};

export const mockLoginResponseCommon: AuthenticationResponseDto = {
  session: {
    accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mocked_common_token",
    tokenVersion: 2,
    passwordResetRequired: false,
  },
  user: mockCommonUser,
};

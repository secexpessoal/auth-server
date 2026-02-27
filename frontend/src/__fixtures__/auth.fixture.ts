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
};

export const mockLoginResponseAdmin: AuthenticationResponseDto = {
  session: {
    access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mocked_admin_token",
    token_version: 2,
    password_reset_required: false,
  },
  user: mockAdminUser,
};

export const mockLoginResponseCommon: AuthenticationResponseDto = {
  session: {
    access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mocked_common_token",
    token_version: 2,
    password_reset_required: false,
  },
  user: mockCommonUser,
};

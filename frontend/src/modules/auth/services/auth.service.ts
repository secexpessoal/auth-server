import { axiosClient } from "@lib/axios/axios.util";
import type { AuthenticationRequestDto, AuthenticationResponseDto, UserResponseDto } from "@modules/auth/molecule/auth.types";
import { useAuthStore } from "@store/auth.store";

export async function loginAttempt(payload: AuthenticationRequestDto): Promise<AuthenticationResponseDto> {
  const { data } = await axiosClient.post<AuthenticationResponseDto>("/v1/user/login", payload);
  useAuthStore.getState().setAuth(data.session, data.user);
  return data;
}

export async function logoutAttempt(): Promise<void> {
  try {
    await axiosClient.post("/v1/user/logout");
  } finally {
    useAuthStore.getState().clearAuth();
  }
}

export async function firstChangePasswordAttempt(password: string): Promise<void> {
  await axiosClient.post("/v1/password/first-change", {
    newPassword: password,
  });
  useAuthStore.getState().clearAuth();
}

export async function getProfile(): Promise<UserResponseDto> {
  const { data } = await axiosClient.get<UserResponseDto>("/v1/user/profile");
  return data;
}

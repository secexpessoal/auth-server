import { axiosClient } from "@lib/infra/axios/axios.util";
import type { AuthenticationRequestDto, AuthenticationResponseDto, UserResponseDto } from "@lib/data/auth/molecule/auth.types";
import { useAuthStore } from "@lib/store/auth.store";

export async function loginAttempt(payload: AuthenticationRequestDto): Promise<AuthenticationResponseDto> {
  const { data } = await axiosClient.post<AuthenticationResponseDto>("/v2/user/login", payload);
  // NOTE: Não atualizamos o Store aqui para evitar que o Router tente renderizar o Dashboard 
  // antes do redirecionamento de volta para o Siaap acontecer.
  // useAuthStore.getState().setAuth(data.session, data.user); 
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

export async function changePasswordAttempt(payload: { oldPassword: string; newPassword: string }): Promise<void> {
  await axiosClient.post("/v1/password/change", payload);
}

export async function resetPasswordAttempt(email: string): Promise<void> {
  await axiosClient.post("/v1/password/user-reset", { email });
}

export async function getProfile(): Promise<UserResponseDto> {
  const { data } = await axiosClient.get<UserResponseDto>("/v2/user/profile");
  return data;
}

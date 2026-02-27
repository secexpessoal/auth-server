import { axiosClient } from "../../../lib/axios/axios.util";
import type { RegisterRequestDto, RegisterResponseDto, PaginatedResponseDto } from "../molecule/user.types";
import type { UserResponseDto } from "../../auth/molecule/auth.types";

/**
 * Registra um novo administrador. Somente usuários com Role.ADMIN podem fazer isso.
 */
export async function registerAdminAttempt(payload: RegisterRequestDto): Promise<RegisterResponseDto> {
  const { data } = await axiosClient.post<RegisterResponseDto>("/v1/user/register/admin", payload);
  return data;
}

/**
 * Registra um novo usuário comum.
 */
export async function registerUserAttempt(payload: RegisterRequestDto): Promise<RegisterResponseDto> {
  const { data } = await axiosClient.post<RegisterResponseDto>("/v1/user/register", payload);
  return data;
}

/**
 * Busca a lista paginada de usuários.
 */
export async function getUsersList(page = 0, limit = 50): Promise<PaginatedResponseDto<UserResponseDto>> {
  const { data } = await axiosClient.get<PaginatedResponseDto<UserResponseDto>>(`/v1/user`, {
    params: { page, limit },
  });
  return data;
}

/**
 * Reseta a senha de um usuário através de um administrador.
 */
export async function resetPasswordAttempt(email: string): Promise<{ status: string; temp_password: string }> {
  const { data } = await axiosClient.post<{ status: string; temp_password: string }>("/v1/password/admin-reset", { email });
  return data;
}

/**
 * Desativa um usuário através de um administrador.
 */
export async function deactivateUserAttempt(userId: string): Promise<void> {
  await axiosClient.patch("/v1/user/deactivate", null, {
    params: { id: userId },
  });
}

/**
 * Ativa um usuário através de um administrador.
 */
export async function activateUserAttempt(userId: string): Promise<void> {
  await axiosClient.patch("/v1/user/activate", null, {
    params: { id: userId },
  });
}

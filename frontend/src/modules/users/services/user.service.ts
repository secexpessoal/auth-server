import { axiosClient } from "@lib/axios/axios.util";
import type { UserResponseDto } from "../../auth/molecule/auth.types";
import type { UpdateUserProfileRequestDto } from "../molecule/user.schema";
import type { PaginatedResponseDto, RegisterRequestDto, RegisterResponseDto } from "../molecule/user.types";

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
export async function getUsersList(
  page = 0,
  limit = 50,
  email?: string,
  userName?: string,
  position?: string,
): Promise<PaginatedResponseDto<UserResponseDto>> {
  const { data } = await axiosClient.get<PaginatedResponseDto<UserResponseDto>>(`/v1/user`, {
    params: { page, limit, email, userName, position },
  });
  return data;
}

/**
 * Reseta a senha de um usuário através de um administrador.
 */
export async function resetPasswordAttempt(email: string): Promise<{ status: string; tempPassword: string }> {
  const { data } = await axiosClient.post<{ status: string; tempPassword: string }>("/v1/password/admin-reset", { email });
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
/**
 * Atualiza o perfil de um usuário.
 */
export async function updateUserProfile(userId: string, payload: UpdateUserProfileRequestDto): Promise<UserResponseDto> {
  const { data } = await axiosClient.patch<UserResponseDto>(`/v1/user/profile/${userId}`, payload);
  return data;
}

/**
 * Atualiza os cargos (roles) de um usuário.
 */
export async function updateUserRoles(userId: string, roles: string[]): Promise<UserResponseDto> {
  // O backend espera um set de Role (enum), enviamos as strings sem o prefixo ROLE_
  const sanitizedRoles = roles.map((r) => r.replace("ROLE_", ""));
  const { data } = await axiosClient.patch<UserResponseDto>(`/v1/user/${userId}/roles`, { roles: sanitizedRoles });
  return data;
}

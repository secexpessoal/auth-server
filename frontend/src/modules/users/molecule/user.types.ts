import type { UserResponseDto } from "@modules/auth/molecule/auth.types";

export type RegisterResponseDto = UserResponseDto;

export type RegisterRequestDto = {
  email: string;
  username: string;
  role?: "USER" | "MANAGER";
};

export type PaginationMetaDto = {
  page: number;
  limit: number;
  hasNext: boolean;
  totalPages: number;
  totalItems: number;
  hasPrevious: boolean;
};

export type PaginatedResponseDto<T> = {
  data: T[];
  meta: {
    pagination: PaginationMetaDto;
  };
  links: {
    next: string;
    prev: string;
  };
};

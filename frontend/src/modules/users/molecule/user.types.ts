import type { UserResponseDto } from "../../auth/molecule/auth.types";

export type RegisterRequestDto = {
  email: string;
  username: string;
};

export type RegisterResponseDto = UserResponseDto;

export type UpdateUserProfileRequestDto = {
  username?: string;
  registration?: string;
  position?: string | null;
  birth_date?: string | null;
  work_regime?: "HOME_WORK" | "OFFICE" | "HYBRID";
  lives_elsewhere?: boolean;
  in_person_work_period?: {
    start: string | null;
    end: string | null;
  } | null;
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

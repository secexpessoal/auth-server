// Reusing MetadataUserResponseDto because RegisterController returns it directly now
import type { MetadataUserResponseDto } from "../../auth/molecule/auth.types";

export type RegisterRequestDto = {
  email: string;
  username: string;
};

export type RegisterResponseDto = MetadataUserResponseDto;

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

export type RegisterResponseDto = {
  email: string;
  tempPassword: string;
};

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

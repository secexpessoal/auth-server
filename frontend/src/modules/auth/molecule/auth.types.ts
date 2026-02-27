export type MetadataUserResponseDto = {
  id: string;
  role: string;
  email: string;
  active: boolean;
  username: string;
  created_at?: string;
  updated_at?: string;
  updated_by?: string;
  temp_password?: string;
};

export type AuthenticationResponseDto = {
  readonly token: string;
  readonly password_reset_required: boolean;
  readonly metadata: MetadataUserResponseDto;
};

export type AuthenticationRequestDto = {
  email: string;
  password: string;
};

export type DataObjectError = {
  readonly error: string;
  readonly status: number;
  readonly message: string;
};

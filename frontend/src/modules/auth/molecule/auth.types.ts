export type InPersonWorkPeriodDto = {
  start: string | null;
  end: string | null;
};

export type UserProfileResponseDto = {
  username: string;
  registration: string;
  position: string;
  birth_date: string | null;
  work_regime: "HOME_WORK" | "OFFICE" | "HYBRID";
  lives_elsewhere: boolean;
  in_person_work_period: InPersonWorkPeriodDto | null;
};

export type UserAuditResponseDto = {
  created_at: string;
  updated_at: string;
  updated_by: string;
};

export type UserResponseDto = {
  id: string;
  email: string;
  active: boolean;
  roles: string[];
  profile: UserProfileResponseDto;
  audit: UserAuditResponseDto;
  temp_password?: string;
};

export type UserSessionResponseDto = {
  access_token: string;
  token_version: number;
  password_reset_required: boolean;
};

export type AuthenticationResponseDto = {
  readonly session: UserSessionResponseDto;
  readonly user: UserResponseDto;
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

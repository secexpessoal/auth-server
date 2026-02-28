export type InPersonWorkPeriodDto = {
  frequencyCycleWeeks: number;
  frequencyWeekMask: number;
  frequencyDurationDays: number | null;
};

export type UserProfileResponseDto = {
  username: string;
  registration: string;
  position: string;
  birthDate: string | null;
  workRegime: "HOME_WORK" | "OFFICE" | "HYBRID";
  livesElsewhere: boolean;
  inPersonWorkPeriod: InPersonWorkPeriodDto | null;
};

export type UserAuditResponseDto = {
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
};

export type UserResponseDto = {
  id: string;
  email: string;
  active: boolean;
  roles: string[];
  profile: UserProfileResponseDto;
  audit: UserAuditResponseDto;
  tempPassword?: string;
};

export type UserSessionResponseDto = {
  accessToken: string;
  tokenVersion: number;
  passwordResetRequired: boolean;
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

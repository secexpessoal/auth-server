export type InPersonWorkPeriodDto = {
  frequencyCycleWeeks: number;
  frequencyWeekMask: number;
  frequencyDurationDays: number | null;
};

export type PositionResponseDto = {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
};

export type UserProfileResponseDto = {
  username: string;
  registration: string;
  position: PositionResponseDto | null;
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
  profile: UserProfileResponseDto | null;
  audit: UserAuditResponseDto;
  tempPassword?: string;
};

export type UserSessionResponseDto = {
  accessToken: string;
  tokenVersion: number;
  passwordResetRequired: boolean;
  profileSetupRequired: boolean;
};

export type AuthenticationResponseDto = {
  readonly session: UserSessionResponseDto;
  readonly user: UserResponseDto;
  readonly redirectUri?: string;
};

export type AuthenticationRequestDto = {
  email: string;
  password: string;
  redirectUri?: string;
};

export type DataObjectError = {
  readonly error: string;
  readonly status: number;
  readonly message: string;
};

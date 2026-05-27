import { axiosClient } from "@lib/infra/axios/axios.util";

export type UserPositionChangeRequestDto = {
  positionId: string;
  eventType: string;
  isTemporary: boolean;
  endDate?: string;
  reason?: string;
};

export type UserPositionHistoryResponseDto = {
  id: string;
  userId: string;
  eventType: string;
  fromPositionId: string | null;
  fromPositionName: string | null;
  toPositionId: string;
  toPositionName: string;
  temporary: boolean;
  plannedEndDate: string | null;
  occurredAt: string;
  changedBy: string;
  reason: string | null;
};

export async function changeUserPosition(userId: string, payload: UserPositionChangeRequestDto): Promise<void> {
  await axiosClient.post(`/v2/user/positions/${userId}`, payload);
}

export async function getUserPositionHistory(userId: string): Promise<UserPositionHistoryResponseDto[]> {
  const { data } = await axiosClient.get<UserPositionHistoryResponseDto[]>(`/v2/user/positions/${userId}/history`);
  return data;
}

export async function getGlobalPositionHistory(): Promise<UserPositionHistoryResponseDto[]> {
  const { data } = await axiosClient.get<UserPositionHistoryResponseDto[]>("/v2/user/positions/history");
  return data;
}

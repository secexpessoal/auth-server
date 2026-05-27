import { axiosClient } from "@lib/infra/axios/axios.util";
import type { PositionResponseDto } from "@lib/data/auth/molecule/auth.types";

export type PositionRequestDto = {
  name: string;
};

export type PositionUpdateDto = {
  name?: string;
  active?: boolean;
};

export type EnumTypeResponseDto = {
  value: string;
  label: string;
  description: string;
};

export async function createPosition(payload: PositionRequestDto): Promise<PositionResponseDto> {
  const { data } = await axiosClient.post<PositionResponseDto>("/v2/positions", payload);
  return data;
}

export async function getPositionEventTypes(): Promise<EnumTypeResponseDto[]> {
  const { data } = await axiosClient.get<EnumTypeResponseDto[]>("/v2/positions/event-types");
  return data;
}

export async function updatePosition(id: string, payload: PositionUpdateDto): Promise<PositionResponseDto> {
  const { data } = await axiosClient.patch<PositionResponseDto>(`/v2/positions/${id}`, payload);
  return data;
}

export async function getAllPositions(): Promise<PositionResponseDto[]> {
  const { data } = await axiosClient.get<PositionResponseDto[]>("/v2/positions");
  return data;
}

export async function getActivePositions(): Promise<PositionResponseDto[]> {
  const { data } = await axiosClient.get<PositionResponseDto[]>("/v2/positions/active");
  return data;
}

export async function togglePositionStatus(id: string): Promise<PositionResponseDto> {
  const { data } = await axiosClient.patch<PositionResponseDto>(`/v2/positions/${id}/toggle`);
  return data;
}

import { api } from "./client";
import type { Dictat, DictatConfig } from "../data/types";

interface DictatsListResponse {
  dictats: Dictat[];
}

interface DictatResponse {
  dictat: Dictat;
}

interface SuccessResponse {
  success: boolean;
}

export function listDictats(): Promise<DictatsListResponse> {
  return api.get<DictatsListResponse>("/dictats");
}

export function getDictat(id: string): Promise<DictatResponse> {
  return api.get<DictatResponse>(`/dictats/${id}`);
}

export function createDictat(params: {
  text: string;
  title?: string;
  config?: DictatConfig;
  hiddenIndices?: number[];
}): Promise<DictatResponse> {
  return api.post<DictatResponse>("/dictats", params);
}

export function updateDictat(
  id: string,
  params: {
    title?: string;
    text?: string;
    config?: DictatConfig;
    hiddenIndices?: number[];
  },
): Promise<DictatResponse> {
  return api.put<DictatResponse>(`/dictats/${id}`, params);
}

export function deleteDictat(id: string): Promise<SuccessResponse> {
  return api.del<SuccessResponse>(`/dictats/${id}`);
}

import { withClient } from "./client";
import type { Effect } from "effect";
import type {
  ApiSuccessType,
  CreateDictatRequestType,
  DictatResponseType,
  DictatsListResponseType,
  PublicDictatType,
  UpdateDictatRequestType,
} from "@dictat/shared";
import type { ApiError } from "./client";

/** Lists dictats using the shared Dictats.listDictats endpoint contract. */
export function listDictats(): Effect.Effect<DictatsListResponseType, ApiError> {
  return withClient((client) => client.Dictats.listDictats());
}

/** Loads one dictat using the shared Dictats.getDictat endpoint contract. */
export function getDictat(id: string): Effect.Effect<DictatResponseType, ApiError> {
  return withClient((client) => client.Dictats.getDictat({ params: { id } }));
}

/** Loads one public dictat using the shared Dictats.getPublicDictat endpoint contract. */
export function getPublicDictat(id: string): Effect.Effect<PublicDictatType, ApiError> {
  return withClient((client) => client.Dictats.getPublicDictat({ params: { id } }));
}

/** Creates a dictat using the shared Dictats.createDictat endpoint contract. */
export function createDictat(
  params: CreateDictatRequestType,
): Effect.Effect<DictatResponseType, ApiError> {
  return withClient((client) => client.Dictats.createDictat({ payload: params }));
}

/** Updates a dictat using the shared Dictats.updateDictat endpoint contract. */
export function updateDictat(
  id: string,
  params: UpdateDictatRequestType,
): Effect.Effect<DictatResponseType, ApiError> {
  return withClient((client) => client.Dictats.updateDictat({ params: { id }, payload: params }));
}

/** Deletes a dictat using the shared Dictats.deleteDictat endpoint contract. */
export function deleteDictat(id: string): Effect.Effect<ApiSuccessType, ApiError> {
  return withClient((client) => client.Dictats.deleteDictat({ params: { id } }));
}

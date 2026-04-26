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

/** Create payload accepted by React state and normalized before encoding. */
interface CreateDictatOptions extends Omit<CreateDictatRequestType, "hiddenIndices"> {
  /** Word positions hidden by default in the new dictat. */
  readonly hiddenIndices?: ReadonlyArray<number>;
}

/** Update payload accepted by React state and normalized before encoding. */
interface UpdateDictatOptions extends Omit<UpdateDictatRequestType, "hiddenIndices"> {
  /** Word positions hidden by default in the edited dictat. */
  readonly hiddenIndices?: ReadonlyArray<number>;
}

/** Converts a create payload to the mutable array shape expected by the endpoint schema type. */
const toCreatePayload = (params: CreateDictatOptions): CreateDictatRequestType => {
  if (params.hiddenIndices === undefined) return params;
  return { ...params, hiddenIndices: [...params.hiddenIndices] };
};

/** Converts an update payload to the mutable array shape expected by the endpoint schema type. */
const toUpdatePayload = (params: UpdateDictatOptions): UpdateDictatRequestType => {
  if (params.hiddenIndices === undefined) return params;
  return { ...params, hiddenIndices: [...params.hiddenIndices] };
};

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
  params: CreateDictatOptions,
): Effect.Effect<DictatResponseType, ApiError> {
  return withClient((client) => client.Dictats.createDictat({ payload: toCreatePayload(params) }));
}

/** Updates a dictat using the shared Dictats.updateDictat endpoint contract. */
export function updateDictat(
  id: string,
  params: UpdateDictatOptions,
): Effect.Effect<DictatResponseType, ApiError> {
  return withClient((client) =>
    client.Dictats.updateDictat({ params: { id }, payload: toUpdatePayload(params) }),
  );
}

/** Deletes a dictat using the shared Dictats.deleteDictat endpoint contract. */
export function deleteDictat(id: string): Effect.Effect<ApiSuccessType, ApiError> {
  return withClient((client) => client.Dictats.deleteDictat({ params: { id } }));
}

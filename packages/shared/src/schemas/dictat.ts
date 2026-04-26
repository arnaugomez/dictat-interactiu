import { Schema } from "effect";

/** A non-negative integer token index hidden in a dictat. */
const HiddenIndex = Schema.Number.check(Schema.isInt(), Schema.isGreaterThanOrEqualTo(0));

export const DictatConfig = Schema.Struct({
  lletraPal: Schema.Boolean,
  fontSize: Schema.Number.check(Schema.isBetween({ minimum: 14, maximum: 40 })),
  hidePct: Schema.Number.check(Schema.isBetween({ minimum: 0, maximum: 100 })),
  fontType: Schema.Literals(["impremta", "lligada"]),
});
export type DictatConfig = typeof DictatConfig.Type;

export const Dictat = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  text: Schema.String,
  config: DictatConfig,
  hiddenIndices: Schema.Array(HiddenIndex),
  isPublic: Schema.Boolean,
  createdAt: Schema.Number,
  updatedAt: Schema.Number,
});
export type Dictat = typeof Dictat.Type;

export const PublicDictat = Schema.Struct({
  dictat: Dictat,
  isOwner: Schema.Boolean,
});
export type PublicDictat = typeof PublicDictat.Type;

export const DictatResponse = Schema.Struct({
  dictat: Dictat,
});
export type DictatResponse = typeof DictatResponse.Type;

export const DictatsListResponse = Schema.Struct({
  dictats: Schema.Array(Dictat),
});
export type DictatsListResponse = typeof DictatsListResponse.Type;

export const CreateDictatRequest = Schema.Struct({
  text: Schema.String,
  title: Schema.optional(Schema.String),
  config: Schema.optional(DictatConfig),
  hiddenIndices: Schema.optional(Schema.Array(HiddenIndex)),
});
export type CreateDictatRequest = typeof CreateDictatRequest.Type;

export const UpdateDictatRequest = Schema.Struct({
  title: Schema.optional(Schema.String),
  text: Schema.optional(Schema.String),
  config: Schema.optional(DictatConfig),
  hiddenIndices: Schema.optional(Schema.Array(HiddenIndex)),
  isPublic: Schema.optional(Schema.Boolean),
});
export type UpdateDictatRequest = typeof UpdateDictatRequest.Type;

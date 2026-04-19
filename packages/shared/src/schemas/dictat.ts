import { Schema } from "effect";

export const DictatConfig = Schema.Struct({
  lletraPal: Schema.Boolean,
  fontSize: Schema.Number,
  hidePct: Schema.Number,
  fontType: Schema.Literals(["impremta", "lligada"]),
});
export type DictatConfig = typeof DictatConfig.Type;

export const Dictat = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  text: Schema.String,
  config: DictatConfig,
  hiddenIndices: Schema.Array(Schema.Number),
  createdAt: Schema.Number,
  updatedAt: Schema.Number,
});
export type Dictat = typeof Dictat.Type;

export const CreateDictatRequest = Schema.Struct({
  text: Schema.String,
  title: Schema.optional(Schema.String),
  config: Schema.optional(DictatConfig),
  hiddenIndices: Schema.optional(Schema.Array(Schema.Number)),
});
export type CreateDictatRequest = typeof CreateDictatRequest.Type;

export const UpdateDictatRequest = Schema.Struct({
  title: Schema.optional(Schema.String),
  text: Schema.optional(Schema.String),
  config: Schema.optional(DictatConfig),
  hiddenIndices: Schema.optional(Schema.Array(Schema.Number)),
});
export type UpdateDictatRequest = typeof UpdateDictatRequest.Type;

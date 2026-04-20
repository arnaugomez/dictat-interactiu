import { Effect, Schema } from "effect";

export class CryptoError extends Schema.TaggedErrorClass<CryptoError>()("CryptoError", {
  message: Schema.String,
  cause: Schema.Defect,
}) {}

export const hashPassword = (password: string) =>
  Effect.tryPromise({
    try: () => Bun.password.hash(password, { algorithm: "argon2id" }),
    catch: (cause) =>
      new CryptoError({
        message: cause instanceof Error ? cause.message : String(cause),
        cause: cause instanceof Error ? cause : new Error(String(cause)),
      }),
  });

export const verifyPassword = (password: string, hash: string) =>
  Effect.tryPromise({
    try: () => Bun.password.verify(password, hash),
    catch: (cause) =>
      new CryptoError({
        message: cause instanceof Error ? cause.message : String(cause),
        cause: cause instanceof Error ? cause : new Error(String(cause)),
      }),
  });

export const generateToken = () =>
  Effect.sync(() => {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  });

export const generateId = () =>
  Effect.sync(() => {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  });

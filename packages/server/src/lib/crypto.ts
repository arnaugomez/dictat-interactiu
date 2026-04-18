import { Effect } from "effect"

export const hashPassword = (password: string) =>
  Effect.promise(() => Bun.password.hash(password, { algorithm: "argon2id" }))

export const verifyPassword = (password: string, hash: string) =>
  Effect.promise(() => Bun.password.verify(password, hash))

export const generateToken = () =>
  Effect.sync(() => {
    const bytes = new Uint8Array(32)
    crypto.getRandomValues(bytes)
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  })

export const generateId = () =>
  Effect.sync(() => {
    const bytes = new Uint8Array(16)
    crypto.getRandomValues(bytes)
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  })

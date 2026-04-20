import { Context, Layer, Effect, Schema } from "effect";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema.js";

export class DatabaseError extends Schema.TaggedErrorClass<DatabaseError>()("DatabaseError", {
  message: Schema.String,
  cause: Schema.Defect,
}) {}

export const runDb = <T>(fn: () => T): Effect.Effect<T, DatabaseError> =>
  Effect.try({
    try: fn,
    catch: (cause) =>
      new DatabaseError({
        message: cause instanceof Error ? cause.message : String(cause),
        cause: cause instanceof Error ? cause : new Error(String(cause)),
      }),
  });

export type DbClient = ReturnType<typeof drizzle<typeof schema>>;

export class Db extends Context.Service<
  Db,
  {
    readonly client: DbClient;
  }
>()("@dictat/Db") {}

export const makeDbLayer = (url: string) =>
  Layer.sync(Db, () => {
    const sqlite = new Database(url);
    sqlite.exec("PRAGMA journal_mode = WAL");
    sqlite.exec("PRAGMA foreign_keys = ON");
    const client = drizzle(sqlite, { schema });
    return { client };
  });

import { Context, Layer } from "effect"
import { Database } from "bun:sqlite"
import { drizzle } from "drizzle-orm/bun-sqlite"
import * as schema from "./schema.js"

export type DbClient = ReturnType<typeof drizzle<typeof schema>>

export class Db extends Context.Service<Db, {
  readonly client: DbClient
}>()("@dictat/Db") {}

export const makeDbLayer = (url: string) =>
  Layer.sync(Db, () => {
    const sqlite = new Database(url)
    sqlite.exec("PRAGMA journal_mode = WAL")
    sqlite.exec("PRAGMA foreign_keys = ON")
    const client = drizzle(sqlite, { schema })
    return { client }
  })

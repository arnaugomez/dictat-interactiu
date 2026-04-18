import { Database } from "bun:sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { drizzle } from "drizzle-orm/bun-sqlite";

export function runMigrations(databaseUrl: string) {
  const sqlite = new Database(databaseUrl);
  sqlite.exec("PRAGMA journal_mode = WAL");
  sqlite.exec("PRAGMA foreign_keys = ON");
  const db = drizzle(sqlite);
  migrate(db, { migrationsFolder: new URL("../../drizzle", import.meta.url).pathname });
  sqlite.close();
}

// Run migrations if called directly
if (import.meta.main) {
  const url = process.env.DATABASE_URL || "./data.db";
  console.log(`Running migrations on ${url}...`);
  runMigrations(url);
  console.log("Migrations complete.");
}

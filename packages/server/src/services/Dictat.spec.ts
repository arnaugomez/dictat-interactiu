import { describe, expect, it } from "vitest";
import { Effect, Layer } from "effect";
import { Database } from "bun:sqlite";
import { DictatService, DictatServiceLive } from "./Dictat.js";
import { makeDbLayer } from "../db/client.js";

const TestDbLive = (url: string) => makeDbLayer(url);

function migrateTestDb(url: string) {
  const db = new Database(url);
  db.exec("PRAGMA foreign_keys = ON");
  db.exec(`
    CREATE TABLE users (
      id text PRIMARY KEY NOT NULL,
      name text NOT NULL,
      email text NOT NULL UNIQUE,
      password_hash text NOT NULL,
      email_verified integer DEFAULT 0 NOT NULL,
      created_at integer NOT NULL,
      updated_at integer NOT NULL
    );
    CREATE TABLE dictats (
      id text PRIMARY KEY NOT NULL,
      user_id text NOT NULL,
      title text NOT NULL,
      text text NOT NULL,
      config text NOT NULL,
      hidden_indices text NOT NULL,
      is_public integer DEFAULT false NOT NULL,
      created_at integer NOT NULL,
      updated_at integer NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE cascade
    );
  `);
  db.query(
    "INSERT INTO users (id, name, email, password_hash, email_verified, created_at, updated_at) VALUES ($id, $name, $email, $passwordHash, 1, 1, 1)",
  ).run({
    $id: "user-1",
    $name: "User One",
    $email: "user-1@example.test",
    $passwordHash: "hash",
  });
  db.close();
}

function testDbUrl(name: string): string {
  return `/tmp/dictat-${name}-${Date.now()}-${Math.random().toString(16).slice(2)}.db`;
}

const runWithService = <A>(effect: Effect.Effect<A, unknown, DictatService>, url: string) =>
  Effect.runPromise(
    effect.pipe(Effect.provide(DictatServiceLive.pipe(Layer.provideMerge(TestDbLive(url))))),
  );

describe("DictatService sharing", () => {
  it("creates dictations as private by default and hides them from public access", async () => {
    const url = testDbUrl("private-default");
    migrateTestDb(url);

    await expect(
      runWithService(
        Effect.gen(function* () {
          const service = yield* DictatService;
          const dictat = yield* service.create("user-1", { text: "El gat" });
          expect(dictat.isPublic).toBe(false);
          return yield* service.getPublicById(dictat.id);
        }),
        url,
      ),
    ).rejects.toMatchObject({ _tag: "NotFoundError" });
  });

  it("returns public dictations and owner metadata when sharing is enabled", async () => {
    const url = testDbUrl("public-owner");
    migrateTestDb(url);

    const result = await runWithService(
      Effect.gen(function* () {
        const service = yield* DictatService;
        const created = yield* service.create("user-1", { text: "El gat" });
        const updated = yield* service.update(created.id, "user-1", { isPublic: true });
        const ownerView = yield* service.getPublicById(updated.id, "user-1");
        const publicView = yield* service.getPublicById(updated.id, "other-user");
        return { updated, ownerView, publicView };
      }),
      url,
    );

    expect(result.updated.isPublic).toBe(true);
    expect(result.ownerView.isOwner).toBe(true);
    expect(result.publicView.isOwner).toBe(false);
  });

  it("only lets the owner update sharing state", async () => {
    const url = testDbUrl("owner-only");
    migrateTestDb(url);

    await expect(
      runWithService(
        Effect.gen(function* () {
          const service = yield* DictatService;
          const created = yield* service.create("user-1", { text: "El gat" });
          return yield* service.update(created.id, "other-user", { isPublic: true });
        }),
        url,
      ),
    ).rejects.toMatchObject({ _tag: "NotFoundError" });
  });
});

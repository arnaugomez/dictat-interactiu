import { Effect, Context, Layer } from "effect";
import { eq, and, desc } from "drizzle-orm";
import { Db } from "../db/client.js";
import * as schema from "../db/schema.js";
import * as crypto from "../lib/crypto.js";
import { NotFoundError } from "./Auth.js";
import type { Dictat as DictatType } from "@dictat/shared";

export class DictatService extends Context.Service<
  DictatService,
  {
    readonly list: (userId: string) => Effect.Effect<DictatType[]>;
    readonly getById: (id: string, userId: string) => Effect.Effect<DictatType, NotFoundError>;
    readonly create: (
      userId: string,
      data: {
        text: string;
        title?: string | undefined;
        config?: DictatType["config"] | undefined;
        hiddenIndices?: number[] | undefined;
      },
    ) => Effect.Effect<DictatType>;
    readonly update: (
      id: string,
      userId: string,
      data: {
        title?: string | undefined;
        text?: string | undefined;
        config?: DictatType["config"] | undefined;
        hiddenIndices?: number[] | undefined;
      },
    ) => Effect.Effect<DictatType, NotFoundError>;
    readonly remove: (id: string, userId: string) => Effect.Effect<void, NotFoundError>;
  }
>()("@dictat/Dictat") {}

export const DictatServiceLive = Layer.effect(
  DictatService,
  Effect.gen(function* () {
    const { client: db } = yield* Db;

    const toApiDictat = (row: typeof schema.dictats.$inferSelect): DictatType => ({
      id: row.id,
      title: row.title,
      text: row.text,
      config: JSON.parse(row.config),
      hiddenIndices: JSON.parse(row.hiddenIndices),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });

    const list = (userId: string) =>
      Effect.sync(() =>
        db
          .select()
          .from(schema.dictats)
          .where(eq(schema.dictats.userId, userId))
          .orderBy(desc(schema.dictats.updatedAt))
          .all()
          .map(toApiDictat),
      );

    const getById = Effect.fn("Dictat.getById")(function* (id: string, userId: string) {
      const row = db.query.dictats
        .findFirst({
          where: and(eq(schema.dictats.id, id), eq(schema.dictats.userId, userId)),
        })
        .sync();
      if (!row) {
        return yield* new NotFoundError({ message: "Dictat not found" });
      }
      return toApiDictat(row);
    });

    const create = Effect.fn("Dictat.create")(function* (
      userId: string,
      data: {
        text: string;
        title?: string | undefined;
        config?: DictatType["config"] | undefined;
        hiddenIndices?: number[] | undefined;
      },
    ) {
      const id = yield* crypto.generateId();
      const now = Date.now();
      const defaultTitle = new Date().toLocaleDateString("ca-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const defaultConfig = {
        lletraPal: false,
        fontSize: 22,
        hidePct: 100,
        fontType: "impremta" as const,
      };
      const row = {
        id,
        userId,
        title: data.title || defaultTitle,
        text: data.text,
        config: JSON.stringify(data.config || defaultConfig),
        hiddenIndices: JSON.stringify(data.hiddenIndices || []),
        createdAt: now,
        updatedAt: now,
      };
      db.insert(schema.dictats).values(row).run();
      return toApiDictat(row);
    });

    const update = Effect.fn("Dictat.update")(function* (
      id: string,
      userId: string,
      data: {
        title?: string | undefined;
        text?: string | undefined;
        config?: DictatType["config"] | undefined;
        hiddenIndices?: number[] | undefined;
      },
    ) {
      const existing = db.query.dictats
        .findFirst({
          where: and(eq(schema.dictats.id, id), eq(schema.dictats.userId, userId)),
        })
        .sync();
      if (!existing) {
        return yield* new NotFoundError({ message: "Dictat not found" });
      }
      const now = Date.now();
      const updates: Record<string, unknown> = { updatedAt: now };
      if (data.title !== undefined) updates.title = data.title;
      if (data.text !== undefined) updates.text = data.text;
      if (data.config !== undefined) updates.config = JSON.stringify(data.config);
      if (data.hiddenIndices !== undefined)
        updates.hiddenIndices = JSON.stringify(data.hiddenIndices);

      db.update(schema.dictats)
        .set(updates)
        .where(and(eq(schema.dictats.id, id), eq(schema.dictats.userId, userId)))
        .run();

      const updated = db.query.dictats
        .findFirst({
          where: eq(schema.dictats.id, id),
        })
        .sync();
      return toApiDictat(updated!);
    });

    const remove = Effect.fn("Dictat.remove")(function* (id: string, userId: string) {
      const existing = db.query.dictats
        .findFirst({
          where: and(eq(schema.dictats.id, id), eq(schema.dictats.userId, userId)),
        })
        .sync();
      if (!existing) {
        return yield* new NotFoundError({ message: "Dictat not found" });
      }
      db.delete(schema.dictats)
        .where(and(eq(schema.dictats.id, id), eq(schema.dictats.userId, userId)))
        .run();
    });

    return { list, getById, create, update, remove };
  }),
);

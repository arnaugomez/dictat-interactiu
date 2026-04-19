import { Effect, Context, Layer, Schema } from "effect";
import { eq, and, desc } from "drizzle-orm";
import { Db, DatabaseError, runDb } from "../db/client.js";
import * as schema from "../db/schema.js";
import * as crypto from "../lib/crypto.js";
import { NotFoundError } from "./Auth.js";
import type { Dictat as DictatType } from "@dictat/shared";
import { DictatConfig } from "@dictat/shared";

const ConfigJson = Schema.fromJsonString(DictatConfig);
const HiddenIndicesJson = Schema.fromJsonString(Schema.Array(Schema.Number));

export class DictatService extends Context.Service<
  DictatService,
  {
    readonly list: (userId: string) => Effect.Effect<DictatType[], DatabaseError>;
    readonly getById: (
      id: string,
      userId: string,
    ) => Effect.Effect<DictatType, NotFoundError | DatabaseError>;
    readonly create: (
      userId: string,
      data: {
        text: string;
        title?: string | undefined;
        config?: DictatType["config"] | undefined;
        hiddenIndices?: number[] | undefined;
      },
    ) => Effect.Effect<DictatType, DatabaseError>;
    readonly update: (
      id: string,
      userId: string,
      data: {
        title?: string | undefined;
        text?: string | undefined;
        config?: DictatType["config"] | undefined;
        hiddenIndices?: number[] | undefined;
      },
    ) => Effect.Effect<DictatType, NotFoundError | DatabaseError>;
    readonly remove: (
      id: string,
      userId: string,
    ) => Effect.Effect<void, NotFoundError | DatabaseError>;
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
      config: Schema.decodeSync(ConfigJson)(row.config),
      hiddenIndices: Schema.decodeSync(HiddenIndicesJson)(row.hiddenIndices),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });

    const list = (userId: string) =>
      runDb(() =>
        db
          .select()
          .from(schema.dictats)
          .where(eq(schema.dictats.userId, userId))
          .orderBy(desc(schema.dictats.updatedAt))
          .all()
          .map(toApiDictat),
      );

    const getById = Effect.fn("Dictat.getById")(function* (id: string, userId: string) {
      const row = yield* runDb(() =>
        db.query.dictats
          .findFirst({
            where: and(eq(schema.dictats.id, id), eq(schema.dictats.userId, userId)),
          })
          .sync(),
      );
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
        config: Schema.encodeSync(ConfigJson)(data.config || defaultConfig),
        hiddenIndices: Schema.encodeSync(HiddenIndicesJson)(data.hiddenIndices || []),
        createdAt: now,
        updatedAt: now,
      };
      yield* runDb(() => db.insert(schema.dictats).values(row).run());
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
      const existing = yield* runDb(() =>
        db.query.dictats
          .findFirst({
            where: and(eq(schema.dictats.id, id), eq(schema.dictats.userId, userId)),
          })
          .sync(),
      );
      if (!existing) {
        return yield* new NotFoundError({ message: "Dictat not found" });
      }
      const now = Date.now();
      const updates: Record<string, unknown> = { updatedAt: now };
      if (data.title !== undefined) updates.title = data.title;
      if (data.text !== undefined) updates.text = data.text;
      if (data.config !== undefined) updates.config = Schema.encodeSync(ConfigJson)(data.config);
      if (data.hiddenIndices !== undefined)
        updates.hiddenIndices = Schema.encodeSync(HiddenIndicesJson)(data.hiddenIndices);

      yield* runDb(() =>
        db
          .update(schema.dictats)
          .set(updates)
          .where(and(eq(schema.dictats.id, id), eq(schema.dictats.userId, userId)))
          .run(),
      );

      const updated = yield* runDb(() =>
        db.query.dictats
          .findFirst({
            where: eq(schema.dictats.id, id),
          })
          .sync(),
      );
      return toApiDictat(updated!);
    });

    const remove = Effect.fn("Dictat.remove")(function* (id: string, userId: string) {
      const existing = yield* runDb(() =>
        db.query.dictats
          .findFirst({
            where: and(eq(schema.dictats.id, id), eq(schema.dictats.userId, userId)),
          })
          .sync(),
      );
      if (!existing) {
        return yield* new NotFoundError({ message: "Dictat not found" });
      }
      yield* runDb(() =>
        db
          .delete(schema.dictats)
          .where(and(eq(schema.dictats.id, id), eq(schema.dictats.userId, userId)))
          .run(),
      );
    });

    return { list, getById, create, update, remove };
  }),
);

import { HttpApiBuilder } from "effect/unstable/httpapi";
import { Effect } from "effect";
import { Api } from "@dictat/shared";

/** Health endpoint implementation backed by the HttpApi contract. */
export const healthRoutes = HttpApiBuilder.group(Api, "Health", (handlers) =>
  handlers.handle("health", () => Effect.succeed({ status: "ok" as const })),
);

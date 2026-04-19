import { HttpRouter, HttpServerResponse } from "effect/unstable/http";

export const healthRoutes = HttpRouter.add(
  "GET",
  "/api/health",
  HttpServerResponse.json({ status: "ok" }),
);

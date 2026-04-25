import { describe, expect, it } from "vitest";
import { buildPublicDictatUrl } from "./share";

describe("buildPublicDictatUrl", () => {
  it("builds a stable public practice URL from the dictation id", () => {
    expect(buildPublicDictatUrl({ origin: "https://example.test", dictatId: "dictat-123" })).toBe(
      "https://example.test/public/practice/dictat-123",
    );
  });

  it("encodes ids for safe URLs", () => {
    expect(buildPublicDictatUrl({ origin: "https://example.test", dictatId: "a/b c" })).toBe(
      "https://example.test/public/practice/a%2Fb%20c",
    );
  });
});

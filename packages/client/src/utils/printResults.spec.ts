import { describe, expect, it, vi } from "vitest";
import type { Dictat } from "../data/types";
import { tokenize } from "./tokenizer";
import { printHtml, renderPracticeResultsPrintHtml } from "./printResults";

const dictat: Dictat = {
  id: "dictat-1",
  title: "Animals",
  text: "El gat\nmenja peix.",
  config: { lletraPal: false, fontSize: 22, hidePct: 100, fontType: "impremta" },
  hiddenIndices: [2, 6],
  isPublic: false,
  createdAt: 1,
  updatedAt: 1,
};

describe("renderPracticeResultsPrintHtml", () => {
  it("renders the full text, score, and correct submitted answers", () => {
    const tokens = tokenize(dictat.text);
    const html = renderPracticeResultsPrintHtml({
      dictat,
      tokens,
      hiddenSet: new Set(dictat.hiddenIndices),
      answers: { 2: "gat", 6: "peix" },
      results: { correct: 2, total: 2, details: { 2: true, 6: true } },
    });

    expect(html).toContain("Animals");
    expect(html).toContain("2 / 2 correctes");
    expect(html).toContain("El");
    expect(html).toContain("gat");
    expect(html).toContain("menja");
    expect(html).toContain("peix");
    expect(html).toContain('class="nl"');
  });

  it("renders wrong answers with both submitted and correct values", () => {
    const tokens = tokenize(dictat.text);
    const html = renderPracticeResultsPrintHtml({
      dictat,
      tokens,
      hiddenSet: new Set(dictat.hiddenIndices),
      answers: { 2: "gos", 6: "peix" },
      results: { correct: 1, total: 2, details: { 2: false, 6: true } },
    });

    expect(html).toContain("gos");
    expect(html).toContain("gat");
    expect(html).toContain('class="answer wrong"');
  });

  it("renders missing answers as the correct answer without a strikethrough", () => {
    const tokens = tokenize(dictat.text);
    const html = renderPracticeResultsPrintHtml({
      dictat,
      tokens,
      hiddenSet: new Set(dictat.hiddenIndices),
      answers: { 2: "" },
      results: { correct: 0, total: 2, details: { 2: false, 6: false } },
    });

    expect(html).not.toContain("Sense resposta");
    expect(html).toContain('<span class="answer wrong"><span class="correction">gat</span></span>');
    expect(html).toContain(
      '<span class="answer wrong"><span class="correction">peix</span></span>',
    );
  });

  it("escapes user-provided text", () => {
    const unsafeDictat = { ...dictat, title: "<script>", text: "A < B" };
    const tokens = tokenize(unsafeDictat.text);
    const html = renderPracticeResultsPrintHtml({
      dictat: unsafeDictat,
      tokens,
      hiddenSet: new Set(),
      answers: {},
      results: { correct: 0, total: 0, details: {} },
    });

    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&lt;");
    expect(html).not.toContain("<script>");
  });
});

describe("printHtml", () => {
  it("writes the document and schedules print", () => {
    const print = vi.fn();
    const focus = vi.fn();
    const write = vi.fn();
    const close = vi.fn();
    const schedulePrint = vi.fn((callback: () => void) => callback());
    const openWindow = vi.fn(() => ({
      document: { write, close },
      focus,
      print,
    })) as unknown as (url?: string, target?: string) => Window | null;

    expect(printHtml({ html: "<p>Result</p>", openWindow, schedulePrint })).toBe(true);
    expect(openWindow).toHaveBeenCalledWith("", "_blank");
    expect(write).toHaveBeenCalledWith("<p>Result</p>");
    expect(close).toHaveBeenCalled();
    expect(focus).toHaveBeenCalled();
    expect(print).toHaveBeenCalled();
  });
});

import type { Dictat } from "../data/types";
import type { Token } from "./tokenizer";
import { toUpper } from "./tokenizer";

/**
 * Reviewed practice result data used to render a printable result page.
 */
export interface PrintablePracticeResults {
  /** Number of hidden words answered correctly. */
  correct: number;
  /** Total number of reviewed hidden words. */
  total: number;
  /** Correctness by token index for each hidden word. */
  details: Record<number, boolean>;
}

/**
 * Options for rendering a printable reviewed practice result.
 */
export interface RenderPracticeResultsPrintOptions {
  /** Dictation that was practiced. */
  dictat: Dictat;
  /** Tokenized dictation text. */
  tokens: Token[];
  /** Hidden token indices that were answered by the student. */
  hiddenSet: Set<number>;
  /** Student answers keyed by token index. */
  answers: Record<number, string>;
  /** Reviewed result summary. */
  results: PrintablePracticeResults;
}

/**
 * Options for triggering browser printing with generated HTML.
 */
export interface PrintHtmlOptions {
  /** Full HTML document to print. */
  html: string;
  /** Browser window opener, injectable for tests. */
  openWindow: (url?: string, target?: string) => Window | null;
  /** Delay before invoking print, injectable for tests. */
  schedulePrint: (callback: () => void, delayMs: number) => void;
}

/**
 * Escapes text for safe inclusion in an HTML document.
 *
 * @param value Text to escape.
 * @returns HTML-safe text.
 */
export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * Renders a full printable HTML document for reviewed practice results.
 *
 * @param options Printable result render options.
 * @returns Printable HTML document.
 */
export function renderPracticeResultsPrintHtml(options: RenderPracticeResultsPrintOptions): string {
  const fs = options.dictat.config.fontSize || 22;
  const ll = options.dictat.config.lletraPal;
  const ft = options.dictat.config.fontType || "impremta";
  const ffam = ft === "lligada" ? "'Playwrite PE', cursive" : "'Nunito', sans-serif";
  const display = (value: string) => (ll ? toUpper(value) : value);
  const title = escapeHtml(display(options.dictat.title || "Dictat"));

  const body = options.tokens
    .map((token, index) => {
      if (token.type === "newline") return `<div class="nl"></div>`;
      if (token.type === "space") return `<span class="sp"> </span>`;
      if (token.type === "punct") return `<span>${escapeHtml(token.value)}</span>`;
      if (token.type === "word" && options.hiddenSet.has(index)) {
        const expected = display(token.value);
        const rawAnswer = options.answers[index]?.trim() ?? "";
        const answer = rawAnswer === "" ? "Sense resposta" : display(rawAnswer);
        const isCorrect = options.results.details[index] ?? false;
        if (isCorrect) {
          return `<span class="answer correct">${escapeHtml(answer)}</span>`;
        }
        return `<span class="answer wrong"><span class="student">${escapeHtml(answer)}</span><span class="correction">${escapeHtml(expected)}</span></span>`;
      }
      return `<span>${escapeHtml(display(token.value))}</span>`;
    })
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Playwrite+PE:wght@100..400&family=Fredoka:wght@400;600;700&family=Nunito:wght@400;600;700&display=swap');
@page{margin:2cm}
body{font-family:${ffam};font-size:${fs}px;line-height:2.4;color:#000;padding:20px}
.wrap{display:flex;flex-wrap:wrap;align-items:baseline}
.sp{display:inline-block;width:0.35em}
.nl{display:block;height:${fs * 0.7}px;flex-basis:100%}
.answer{display:inline-flex;flex-direction:column;align-items:center;justify-content:flex-end;border-radius:4px;padding:0 4px;margin:2px 1px;line-height:1.25}
.correct{border-bottom:2px solid #2E7D32}
.wrong{border:2px solid #C62828}
.student{color:#C62828;text-decoration:line-through;font-size:0.85em}
.correction{color:#000;font-weight:700}
h1{font-family:'Fredoka',sans-serif;font-size:1.3em;text-align:center;margin-bottom:8px}
.score{font-family:'Fredoka',sans-serif;text-align:center;font-weight:700;margin-bottom:18px}
</style></head><body><h1>${title}</h1><div class="score">${options.results.correct} / ${options.results.total} correctes</div><div class="wrap">${body}</div></body></html>`;
}

/**
 * Opens a printable document and invokes browser printing.
 *
 * @param options Print operation options.
 * @returns Whether the print window was opened.
 */
export function printHtml(options: PrintHtmlOptions): boolean {
  const printWindow = options.openWindow("", "_blank");
  if (!printWindow) return false;
  printWindow.document.write(options.html);
  printWindow.document.close();
  printWindow.focus();
  options.schedulePrint(() => printWindow.print(), 350);
  return true;
}

/**
 * Prints reviewed practice results using browser printing.
 *
 * @param options Printable result render options.
 * @returns Whether the print window was opened.
 */
export function printPracticeResults(options: RenderPracticeResultsPrintOptions): boolean {
  return printHtml({
    html: renderPracticeResultsPrintHtml(options),
    openWindow: window.open.bind(window),
    schedulePrint: (callback, delayMs) => setTimeout(callback, delayMs),
  });
}

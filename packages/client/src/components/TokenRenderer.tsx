import type {
  ChangeEvent,
  Dispatch,
  FocusEvent,
  KeyboardEvent,
  MutableRefObject,
  SetStateAction,
} from "react";
import { useCallback, useMemo } from "react";
import { C } from "../theme/colors";
import { getFont } from "../theme/fonts";
import { toUpper, isAlphaChar } from "../utils/tokenizer";
import type { Token } from "../utils/tokenizer";

const ALPHA_RE = /[^a-zA-ZÀ-ÿÑñ·ŀĿ'''-]/g;

interface TokenRendererProps {
  tokens: Token[];
  hiddenSet: Set<number>;
  fontSize: number;
  lletraPal: boolean;
  fontType: string;
  mode?: "preview" | "practice";
  onToggleWord?: (index: number) => void;
  answers?: Record<number, string>;
  setAnswers?: Dispatch<SetStateAction<Record<number, string>>>;
  results?: { correct: number; total: number; details: Record<number, boolean> } | null;
  showCorrections?: boolean;
  inputRefs?: MutableRefObject<Record<number, HTMLInputElement | null>>;
}

export default function TokenRenderer({
  tokens,
  hiddenSet,
  fontSize,
  lletraPal,
  fontType,
  mode = "preview",
  onToggleWord,
  answers,
  setAnswers,
  results,
  showCorrections,
  inputRefs,
}: TokenRendererProps) {
  const ff = getFont(fontType, false);
  const fw = fontType === "lligada" ? 300 : 600;
  const displayT = useCallback((s: string) => (lletraPal ? toUpper(s) : s), [lletraPal]);

  const hiddenOrder = useMemo(
    () =>
      tokens.map((t, i) => (t.type === "word" && hiddenSet.has(i) ? i : -1)).filter((i) => i >= 0),
    [tokens, hiddenSet],
  );
  const focusIdx = useCallback(
    (idx: number) => {
      inputRefs?.current?.[idx]?.focus();
    },
    [inputRefs],
  );
  const focusNext = useCallback(
    (cur: number) => {
      const p = hiddenOrder.indexOf(cur);
      if (p < hiddenOrder.length - 1) focusIdx(hiddenOrder[p + 1]);
    },
    [hiddenOrder, focusIdx],
  );
  const focusPrev = useCallback(
    (cur: number) => {
      const p = hiddenOrder.indexOf(cur);
      if (p > 0) focusIdx(hiddenOrder[p - 1]);
    },
    [hiddenOrder, focusIdx],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>, ti: number) => {
      if (e.nativeEvent.isComposing || e.key === "Dead" || e.key === "Process") return;
      const val = answers?.[ti] || "";
      const el = e.target as HTMLInputElement;
      if (e.key === "ArrowLeft" && el.selectionStart === 0) {
        e.preventDefault();
        focusPrev(ti);
        return;
      }
      if (e.key === "ArrowRight" && el.selectionStart === val.length) {
        e.preventDefault();
        focusNext(ti);
        return;
      }
      if (e.key === " ") {
        e.preventDefault();
        focusNext(ti);
        return;
      }
      if (e.key.length === 1 && !isAlphaChar(e.key) && !e.altKey && !e.metaKey) {
        e.preventDefault();
        focusNext(ti);
        return;
      }
      if (e.key === "Backspace" && val === "") {
        e.preventDefault();
        focusPrev(ti);
        return;
      }
      if (e.key === "Tab") {
        e.preventDefault();
        if (e.shiftKey) {
          focusPrev(ti);
        } else {
          focusNext(ti);
        }
      }
    },
    [answers, focusNext, focusPrev],
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>, ti: number) => {
      let val = e.target.value;
      if ((e.nativeEvent as InputEvent)?.isComposing) {
        setAnswers?.((prev) => ({ ...prev, [ti]: val }));
        return;
      }
      val = val.replace(ALPHA_RE, "");
      if (lletraPal) val = toUpper(val);
      setAnswers?.((prev) => ({ ...prev, [ti]: val }));
    },
    [lletraPal, setAnswers],
  );

  const handleBlur = useCallback(
    (e: FocusEvent<HTMLInputElement>, ti: number, ok: boolean, bad: boolean) => {
      const raw = answers?.[ti] || "";
      const clean = lletraPal ? toUpper(raw.replace(ALPHA_RE, "")) : raw.replace(ALPHA_RE, "");
      if (clean !== raw) setAnswers?.((prev) => ({ ...prev, [ti]: clean }));
      e.currentTarget.style.borderColor = ok ? C.success : bad ? C.error : C.border;
      e.currentTarget.style.boxShadow = "none";
    },
    [answers, lletraPal, setAnswers],
  );

  return (
    <div
      style={{
        lineHeight: mode === "practice" ? 2.8 : 2.5,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "baseline",
      }}
    >
      {tokens.map((token, i) => {
        if (token.type === "newline")
          return <div key={i} style={{ flexBasis: "100%", height: fontSize * 0.7 }} />;
        if (token.type === "space")
          return <span key={i} style={{ display: "inline-block", width: fontSize * 0.35 }} />;
        if (token.type === "punct")
          return (
            <span key={i} style={{ fontSize, fontFamily: ff, fontWeight: fw, color: C.textLight }}>
              {token.value}
            </span>
          );
        const isH = hiddenSet.has(i);

        if (mode === "preview") {
          const wordW = token.value.length * fontSize * 0.65 + 16;
          if (isH)
            return (
              <span
                key={i}
                onClick={() => onToggleWord?.(i)}
                style={{
                  display: "inline-block",
                  width: Math.max(wordW, fontSize * 1.5),
                  height: fontSize * 1.4,
                  border: `2px dashed ${C.primary}88`,
                  borderRadius: 6,
                  background: `${C.primary}08`,
                  cursor: "pointer",
                  verticalAlign: "baseline",
                  margin: "1px 0",
                }}
                title="Clic per desocultar"
              />
            );
          return (
            <span
              key={i}
              onClick={() => onToggleWord?.(i)}
              style={{
                fontSize,
                fontFamily: ff,
                fontWeight: fw,
                color: C.text,
                cursor: "pointer",
                borderBottom: "2px solid transparent",
                transition: "all 0.15s",
                padding: "0 0 1px",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderBottomColor = `${C.primary}44`)}
              onMouseLeave={(e) => (e.currentTarget.style.borderBottomColor = "transparent")}
              title="Clic per ocultar"
            >
              {displayT(token.value)}
            </span>
          );
        }

        if (mode === "practice") {
          if (isH) {
            const baseW = token.value.length * fontSize * 0.65 + 20;
            const ansLen = (answers?.[i] || "").length;
            const w = Math.max(baseW, ansLen * fontSize * 0.65 + 20);
            const checked = results?.details?.[i] !== undefined;
            const ok = checked && (results?.details[i] ?? false);
            const bad = checked && !(results?.details[i] ?? false);
            return (
              <span
                key={i}
                style={{
                  display: "inline-flex",
                  flexDirection: "column",
                  alignItems: "center",
                  margin: "2px 0",
                  verticalAlign: "baseline",
                }}
              >
                <input
                  ref={(el) => {
                    if (inputRefs) inputRefs.current[i] = el;
                  }}
                  type="text"
                  value={answers?.[i] || ""}
                  onChange={(e) => handleChange(e, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  spellCheck={false}
                  autoComplete="off"
                  autoCapitalize="off"
                  style={{
                    width: w,
                    minWidth: fontSize * 1.5,
                    fontSize,
                    fontFamily: ff,
                    fontWeight: fw,
                    textAlign: "center",
                    border: `2px solid ${ok ? C.success : bad ? C.error : C.border}`,
                    borderRadius: 8,
                    background: ok ? C.successBg : bad ? C.errorBg : `${C.primary}06`,
                    color: ok ? C.success : bad ? C.error : C.text,
                    outline: "none",
                    padding: "4px 8px",
                    boxSizing: "content-box",
                    lineHeight: 1.4,
                  }}
                  onFocus={(e) => {
                    if (!results) e.currentTarget.style.borderColor = C.primary;
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${C.primary}22`;
                  }}
                  onBlur={(e) => handleBlur(e, i, ok, bad)}
                />
                {bad && results && showCorrections && (
                  <span
                    style={{
                      fontSize: Math.max(11, fontSize * 0.5),
                      fontFamily: ff,
                      fontWeight: 700,
                      color: C.success,
                      marginTop: 2,
                    }}
                  >
                    {displayT(token.value)}
                  </span>
                )}
              </span>
            );
          }
          return (
            <span key={i} style={{ fontSize, fontFamily: ff, fontWeight: fw, color: C.text }}>
              {displayT(token.value)}
            </span>
          );
        }
        return (
          <span key={i} style={{ fontSize, fontFamily: ff, fontWeight: fw, color: C.text }}>
            {displayT(token.value)}
          </span>
        );
      })}
    </div>
  );
}

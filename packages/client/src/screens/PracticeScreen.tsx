import { useState, useMemo, useEffect, useRef } from "react";
import { C } from "../theme/colors";
import { F } from "../theme/fonts";
import { I } from "../components/Icons";
import { FloatingDeco, Btn } from "../components/ui";
import TokenRenderer from "../components/TokenRenderer";
import { DictatRepository } from "../data/repository";
import { tokenize, toUpper } from "../utils/tokenizer";

interface DictatConfig {
  lletraPal: boolean;
  fontSize: number;
  hidePct: number;
  fontType: "impremta" | "lligada";
}

interface Dictat {
  id: string;
  title: string;
  text: string;
  config: DictatConfig;
  hiddenIndices: number[];
  createdAt: number;
  updatedAt: number;
}

interface CheckResults {
  correct: number;
  total: number;
  details: Record<number, boolean>;
}

interface PracticeScreenProps {
  dictatId: string;
  onBack: () => void;
}

export default function PracticeScreen({ dictatId, onBack }: PracticeScreenProps) {
  const dictat = useMemo<Dictat | null>(
    () => DictatRepository.getById(dictatId) ?? null,
    [dictatId],
  );
  const [fontSize, setFontSize] = useState(dictat?.config?.fontSize ?? 22);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [results, setResults] = useState<CheckResults | null>(null);
  const [showCorrections, setShowCorrections] = useState(false);
  const inputRefs = useRef<Record<number, HTMLInputElement>>({});

  const tokens = useMemo(() => tokenize(dictat?.text || ""), [dictat]);
  const hiddenSet = useMemo(() => new Set(dictat?.hiddenIndices || []), [dictat]);
  const hiddenOrder = useMemo(
    () =>
      tokens.map((t, i) => (t.type === "word" && hiddenSet.has(i) ? i : -1)).filter((i) => i >= 0),
    [tokens, hiddenSet],
  );
  const ll = dictat?.config?.lletraPal ?? false;
  const ft = dictat?.config?.fontType || "impremta";

  useEffect(() => {
    setTimeout(() => {
      if (hiddenOrder.length > 0 && inputRefs.current[hiddenOrder[0]])
        inputRefs.current[hiddenOrder[0]].focus();
    }, 100);
  }, []);

  const checkResults = () => {
    if (!dictat) return;
    let correct = 0;
    const details: Record<number, boolean> = {};
    hiddenOrder.forEach((idx) => {
      const exp = ll ? toUpper(tokens[idx].value) : tokens[idx].value;
      const ok = (answers[idx] ?? "").trim().toLowerCase() === exp.toLowerCase();
      if (ok) correct++;
      details[idx] = ok;
    });
    setResults({ correct, total: hiddenOrder.length, details });
    setShowCorrections(false);
  };

  const scoreEmoji = results
    ? results.correct === results.total
      ? "🎉"
      : results.correct / results.total >= 0.7
        ? "👏"
        : "💪"
    : "";
  const scoreColor = results
    ? results.correct === results.total
      ? C.success
      : results.correct / results.total >= 0.7
        ? C.secondary
        : C.primary
    : C.text;
  if (!dictat)
    return (
      <div style={{ padding: 40, textAlign: "center", fontFamily: F.body }}>Dictat no trobat.</div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <FloatingDeco />
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: `${C.bg}ee`,
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${C.border}`,
          padding: "10px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <Btn variant="ghost" onClick={onBack} style={{ padding: "8px 14px", fontSize: 13 }}>
          <I.back size={18} /> Editar
        </Btn>
        <span
          style={{
            fontFamily: F.display,
            fontSize: 16,
            fontWeight: 700,
            color: C.text,
            flex: 1,
            textAlign: "center",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            minWidth: 0,
          }}
        >
          {dictat.title}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              background: C.card,
              borderRadius: 10,
              border: `1.5px solid ${C.border}`,
              padding: "2px",
            }}
          >
            <button
              onClick={() => setFontSize((s) => Math.max(14, s - 2))}
              title="Reduir"
              style={{
                width: 36,
                height: 36,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: C.textLight,
              }}
            >
              <I.tSmall size={20} />
            </button>
            <span
              style={{
                fontFamily: F.body,
                fontSize: 12,
                fontWeight: 700,
                color: C.text,
                minWidth: 28,
                textAlign: "center",
              }}
            >
              {fontSize}
            </span>
            <button
              onClick={() => setFontSize((s) => Math.min(40, s + 2))}
              title="Augmentar"
              style={{
                width: 36,
                height: 36,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: C.textLight,
              }}
            >
              <I.tBig size={20} />
            </button>
          </div>
          <Btn
            variant="secondary"
            onClick={checkResults}
            style={{ fontFamily: F.display, padding: "9px 20px", fontSize: 14 }}
          >
            <I.check size={17} /> Revisar
          </Btn>
        </div>
      </div>

      {results && (
        <div
          style={{
            margin: "16px auto 0",
            maxWidth: 700,
            width: "calc(100% - 32px)",
            padding: "16px 24px",
            borderRadius: 16,
            background: C.card,
            boxShadow: C.shadowLg,
            border: `2px solid ${scoreColor}44`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            animation: "slideD 0.3s ease",
            zIndex: 5,
            position: "relative",
          }}
        >
          <span style={{ fontSize: 32 }}>{scoreEmoji}</span>
          <div>
            <div
              style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, color: scoreColor }}
            >
              {results.correct} / {results.total} correctes
            </div>
            <div style={{ fontFamily: F.body, fontSize: 13, color: C.textMuted, marginTop: 2 }}>
              {results.correct === results.total
                ? "Perfecte! Ho has encertat tot!"
                : results.correct / results.total >= 0.7
                  ? "Molt bé! Quasi perfecte!"
                  : "Continua practicant, tu pots!"}
            </div>
            {results.correct < results.total && (
              <button
                onClick={() => setShowCorrections((v) => !v)}
                style={{
                  marginTop: 8,
                  background: showCorrections ? `${C.purple}18` : "transparent",
                  border: `1.5px solid ${showCorrections ? C.purple : C.border}`,
                  borderRadius: 10,
                  padding: "6px 14px",
                  cursor: "pointer",
                  fontFamily: F.body,
                  fontSize: 12,
                  fontWeight: 700,
                  color: showCorrections ? C.purple : C.textLight,
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <I.eye size={14} /> {showCorrections ? "Amagar correcció" : "Veure correcció"}
              </button>
            )}
          </div>
        </div>
      )}

      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          padding: "24px 16px 40px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            maxWidth: 700,
            width: "100%",
            background: C.card,
            borderRadius: 20,
            boxShadow: C.shadow,
            border: `1px solid ${C.borderLight}`,
            padding: "clamp(20px,4vw,36px)",
          }}
        >
          <TokenRenderer
            tokens={tokens}
            hiddenSet={hiddenSet}
            fontSize={fontSize}
            lletraPal={ll}
            fontType={ft}
            mode="practice"
            answers={answers}
            setAnswers={setAnswers}
            results={results}
            showCorrections={showCorrections}
            inputRefs={inputRefs}
          />
        </div>
      </div>

      {ll && (
        <div
          style={{
            position: "fixed",
            bottom: 16,
            left: 16,
            background: `${C.accent}22`,
            border: `1.5px solid ${C.accent}44`,
            borderRadius: 10,
            padding: "6px 12px",
            fontFamily: F.body,
            fontSize: 11,
            fontWeight: 700,
            color: C.accentDark,
            zIndex: 10,
          }}
        >
          LLETRA DE PAL
        </div>
      )}
    </div>
  );
}

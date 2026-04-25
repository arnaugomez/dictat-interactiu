import { useState, useMemo, useEffect, useRef } from "react";
import { C } from "../theme/colors";
import { F } from "../theme/fonts";
import { I } from "../components/Icons";
import { FloatingDeco, Btn } from "../components/ui";
import TokenRenderer from "../components/TokenRenderer";
import { getDictat, getPublicDictat } from "../api/dictats";
import type { Dictat } from "../data/types";
import { tokenize, toUpper } from "../utils/tokenizer";
import { printPracticeResults } from "../utils/printResults";

interface CheckResults {
  correct: number;
  total: number;
  details: Record<number, boolean>;
}

interface PracticeScreenProps {
  dictatId: string;
  onBack?: () => void;
  mode?: "owner" | "public";
}

export default function PracticeScreen({ dictatId, onBack, mode = "owner" }: PracticeScreenProps) {
  const [dictat, setDictat] = useState<Dictat | null>(null);
  const [canEdit, setCanEdit] = useState(mode === "owner");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(22);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [results, setResults] = useState<CheckResults | null>(null);
  const [showCorrections, setShowCorrections] = useState(false);
  const inputRefs = useRef<Record<number, HTMLInputElement>>({});

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    const request = mode === "public" ? getPublicDictat(dictatId) : getDictat(dictatId);
    request
      .then((response) => {
        const fetched = response.dictat;
        setDictat(fetched);
        setCanEdit(
          mode === "owner" ||
            ("isOwner" in response && typeof response.isOwner === "boolean"
              ? response.isOwner
              : false),
        );
        setFontSize(fetched.config?.fontSize ?? 22);
      })
      .catch(() => {
        setError(mode === "public" ? "Dictat no trobat." : "No s'ha pogut carregar el dictat.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dictatId, mode]);

  const tokens = useMemo(() => tokenize(dictat?.text ?? ""), [dictat]);
  const hiddenSet = useMemo(() => new Set(dictat?.hiddenIndices ?? []), [dictat]);
  const hiddenOrder = useMemo(
    () =>
      tokens.map((t, i) => (t.type === "word" && hiddenSet.has(i) ? i : -1)).filter((i) => i >= 0),
    [tokens, hiddenSet],
  );
  const ll = dictat?.config?.lletraPal ?? false;
  const ft = dictat?.config?.fontType ?? "impremta";

  useEffect(() => {
    if (!isLoading && dictat) {
      setTimeout(() => {
        if (hiddenOrder.length > 0 && inputRefs.current[hiddenOrder[0]])
          inputRefs.current[hiddenOrder[0]].focus();
      }, 100);
    }
  }, [isLoading, dictat, hiddenOrder]);

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

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: C.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ fontFamily: F.display, fontSize: 20, color: C.textLight }}>Carregant...</div>
      </div>
    );
  }

  if (error || !dictat) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: C.bg,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <div style={{ fontFamily: F.body, fontSize: 16, color: C.error }}>
          {error ?? "Dictat no trobat."}
        </div>
        {canEdit && onBack && (
          <Btn variant="ghost" onClick={onBack} style={{ padding: "8px 14px", fontSize: 13 }}>
            <I.back size={18} /> Tornar
          </Btn>
        )}
      </div>
    );
  }

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
        {canEdit && onBack ? (
          <Btn variant="ghost" onClick={onBack} style={{ padding: "8px 14px", fontSize: 13 }}>
            <I.back size={18} /> Editar
          </Btn>
        ) : (
          <div style={{ width: 82 }} />
        )}
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
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            animation: "slideD 0.3s ease",
            zIndex: 5,
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <span style={{ fontSize: 32, lineHeight: 1 }}>{scoreEmoji}</span>
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
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
            {results.correct < results.total && (
              <button
                onClick={() => setShowCorrections((v) => !v)}
                style={{
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
            <button
              onClick={() =>
                printPracticeResults({
                  dictat,
                  tokens,
                  hiddenSet,
                  answers,
                  results,
                })
              }
              style={{
                background: `${C.secondary}18`,
                border: `1.5px solid ${C.secondary}`,
                borderRadius: 10,
                padding: "6px 14px",
                cursor: "pointer",
                fontFamily: F.body,
                fontSize: 12,
                fontWeight: 700,
                color: C.secondaryDark,
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <I.print size={14} /> Imprimir resultats
            </button>
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

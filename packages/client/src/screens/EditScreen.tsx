import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { C } from "../theme/colors";
import { F } from "../theme/fonts";
import { I } from "../components/Icons";
import { FloatingDeco, Btn, Toggle, ConfirmModal, Toast, Dropdown } from "../components/ui";
import NotFoundView from "../components/NotFoundView";
import TokenRenderer from "../components/TokenRenderer";
import { getDictat, updateDictat } from "../api/dictats";
import type { Dictat, DictatConfig } from "../data/types";
import { randomExample } from "../data/examples";
import { tokenize, computeHiddenIndices } from "../utils/tokenizer";
import { doPrint } from "../utils/print";
import { buildPublicDictatUrl } from "../utils/share";

interface EditScreenProps {
  dictatId: string;
  onBack: () => void;
  onPractice: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function EditScreen({ dictatId, onBack, onPractice, onDelete }: EditScreenProps) {
  const [dictat, setDictat] = useState<Dictat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sliderPct, setSliderPct] = useState(100);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    getDictat(dictatId)
      .then(({ dictat: fetched }) => {
        setDictat(fetched);
        setSliderPct(fetched.config.hidePct || 100);
        setTitleDraft(fetched.title);
      })
      .catch(() => {
        setError("No s'ha pogut carregar el dictat.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dictatId]);

  const debouncedSave = useCallback(
    (patch: {
      title?: string;
      text?: string;
      config?: DictatConfig;
      hiddenIndices?: number[];
      isPublic?: boolean;
    }) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        void updateDictat(dictatId, patch);
      }, 500);
    },
    [dictatId],
  );

  const save = useCallback(
    (patch: Partial<Pick<Dictat, "title" | "text" | "hiddenIndices">>) => {
      setDictat((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...patch };
        debouncedSave(patch);
        return next;
      });
    },
    [debouncedSave],
  );

  const saveCfg = useCallback(
    (patch: Partial<DictatConfig>) => {
      setDictat((prev) => {
        if (!prev) return prev;
        const config = { ...prev.config, ...patch };
        debouncedSave({ config });
        return { ...prev, config };
      });
    },
    [debouncedSave],
  );

  const tokens = useMemo(() => tokenize(dictat?.text ?? ""), [dictat?.text]);
  const hiddenSet = useMemo(() => new Set(dictat?.hiddenIndices ?? []), [dictat?.hiddenIndices]);

  const handleTextChange = useCallback(
    (t: string) => {
      const toks = tokenize(t);
      const hi = computeHiddenIndices(toks, dictat?.config.hidePct ?? 100);
      save({ text: t, hiddenIndices: hi });
    },
    [dictat?.config.hidePct, save],
  );

  const commitHidePct = useCallback(
    (pct: number) => {
      const hi = computeHiddenIndices(tokens, pct);
      setDictat((prev) => {
        if (!prev) return prev;
        const config = { ...prev.config, hidePct: pct };
        debouncedSave({ config, hiddenIndices: hi });
        return { ...prev, config, hiddenIndices: hi };
      });
    },
    [tokens, debouncedSave],
  );

  const toggleWord = useCallback(
    (i: number) => {
      setDictat((prev) => {
        if (!prev) return prev;
        const s = new Set(prev.hiddenIndices ?? []);
        if (s.has(i)) {
          s.delete(i);
        } else {
          s.add(i);
        }
        const hiddenIndices = [...s].sort((a, b) => a - b);
        debouncedSave({ hiddenIndices });
        return { ...prev, hiddenIndices };
      });
    },
    [debouncedSave],
  );

  const fillExample = () => {
    const t = randomExample();
    handleTextChange(t);
    textRef.current?.focus();
  };

  const commitTitle = () => {
    if (!dictat) return;
    const title = titleDraft.trim() || dictat.title;
    save({ title });
    setEditingTitle(false);
  };

  const setPublicSharing = useCallback(
    (isPublic: boolean) => {
      setDictat((prev) => {
        if (!prev) return prev;
        return { ...prev, isPublic };
      });
      void updateDictat(dictatId, { isPublic });
    },
    [dictatId],
  );

  useEffect(() => {
    if (editingTitle && titleRef.current) titleRef.current.focus();
  }, [editingTitle]);

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
      <NotFoundView message={error ?? "Dictat no trobat."} onBack={onBack} backLabel="Llistat" />
    );
  }

  const cfg = dictat.config;
  const wc = tokens.filter((t) => t.type === "word").length;

  const printOpts = [
    { label: "📄  Text del dictat", value: "text" },
    { label: "✏️  Exercici de dictat", value: "exercici" },
    { label: "📄✏️  Text i exercici", value: "ambdos" },
  ];

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
      <style>{`@media(max-width:600px){.btn-label{display:none!important}.hide-mobile{display:none!important}}`}</style>
      <FloatingDeco />
      {/* TOP BAR */}
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
          <I.back size={18} /> Dictats
        </Btn>

        {/* Title */}
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 6,
            minWidth: 0,
          }}
        >
          {editingTitle ? (
            <input
              ref={titleRef}
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitTitle();
                if (e.key === "Escape") {
                  setTitleDraft(dictat.title);
                  setEditingTitle(false);
                }
              }}
              style={{
                fontFamily: F.display,
                fontSize: 16,
                fontWeight: 700,
                color: C.text,
                border: `2px solid ${C.primary}`,
                borderRadius: 8,
                padding: "4px 10px",
                textAlign: "center",
                outline: "none",
                maxWidth: 260,
                width: "100%",
              }}
            />
          ) : (
            <button
              onClick={() => {
                setTitleDraft(dictat.title);
                setEditingTitle(true);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: F.display,
                fontSize: 16,
                fontWeight: 700,
                color: C.text,
                display: "flex",
                alignItems: "center",
                gap: 4,
                maxWidth: 260,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {dictat.title} <I.pencil size={14} stroke={C.textMuted} />
            </button>
          )}
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <Btn
            variant="soft"
            color={C.accentDark}
            onClick={() => setShowShareModal(true)}
            style={{ padding: "8px 14px", fontSize: 13 }}
          >
            <I.logout size={16} /> <span className="btn-label">Compartir</span>
          </Btn>
          <Btn
            variant="ghost"
            onClick={() => setToast("Guardat!")}
            style={{
              padding: "8px 14px",
              fontSize: 13,
              color: C.success,
              borderColor: `${C.success}44`,
            }}
          >
            <I.save size={16} /> <span className="btn-label">Guardar</span>
          </Btn>
          <Dropdown options={printOpts} onSelect={(v) => doPrint(dictat, tokens, hiddenSet, v)}>
            <Btn variant="soft" color={C.purple} style={{ padding: "8px 14px", fontSize: 13 }}>
              <I.print size={16} /> <span className="btn-label">Imprimir</span>{" "}
              <I.chevDown size={14} />
            </Btn>
          </Dropdown>
          <Btn
            variant="secondary"
            onClick={() => onPractice(dictat.id)}
            style={{ fontFamily: F.display, padding: "9px 20px", fontSize: 14 }}
          >
            <I.play size={16} /> Practicar
          </Btn>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "20px 16px 40px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 700,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* TEXT */}
          <div
            style={{
              background: C.card,
              borderRadius: 18,
              boxShadow: C.shadow,
              border: `1px solid ${C.borderLight}`,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "14px 18px 8px",
                fontFamily: F.display,
                fontSize: 14,
                fontWeight: 700,
                color: C.textLight,
              }}
            >
              Text del dictat
            </div>
            <textarea
              ref={textRef}
              value={dictat.text}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Escriu aquí el text del dictat..."
              rows={5}
              style={{
                width: "100%",
                border: "none",
                outline: "none",
                resize: "vertical",
                padding: "4px 18px 50px",
                fontFamily: F.body,
                fontSize: 16,
                lineHeight: 1.7,
                color: C.text,
                background: "transparent",
                boxSizing: "border-box",
                minHeight: 120,
              }}
            />
            <div
              style={{
                padding: "0 14px 14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Btn
                variant="soft"
                color={C.accentDark}
                style={{
                  background: "linear-gradient(135deg,#FFD16618,#FFD16633)",
                  border: `1.5px solid ${C.accentDark}33`,
                  fontSize: 12,
                  padding: "6px 12px",
                }}
                onClick={fillExample}
              >
                <I.star size={14} fc={C.accentDark} /> Exemple
              </Btn>
              <span style={{ fontFamily: F.body, fontSize: 12, color: C.textMuted }}>
                {wc} paraules · {hiddenSet.size} ocultes
              </span>
            </div>
          </div>

          {/* CONFIG */}
          <div
            style={{
              background: C.card,
              borderRadius: 18,
              boxShadow: C.shadow,
              border: `1px solid ${C.borderLight}`,
              overflow: "hidden",
            }}
          >
            <button
              onClick={() => setShowConfig(!showConfig)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 18px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontFamily: F.display,
                fontSize: 14,
                fontWeight: 700,
                color: C.textLight,
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <I.settings size={16} /> Configuració
              </span>
              <span
                style={{
                  transform: showConfig ? "rotate(180deg)" : "rotate(0)",
                  transition: "transform 0.2s",
                  fontSize: 12,
                }}
              >
                ▼
              </span>
            </button>
            {showConfig && (
              <div
                style={{
                  padding: "0 18px 18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 18,
                  animation: "slideD 0.2s ease",
                }}
              >
                {/* Lletra de pal */}
                <div
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <div>
                    <div
                      style={{ fontFamily: F.body, fontSize: 14, fontWeight: 700, color: C.text }}
                    >
                      Lletra de pal (MAJÚSCULES)
                    </div>
                    <div
                      style={{ fontFamily: F.body, fontSize: 12, color: C.textMuted, marginTop: 1 }}
                    >
                      Tot el text en majúscules
                    </div>
                  </div>
                  <Toggle value={cfg.lletraPal} onChange={(v) => saveCfg({ lletraPal: v })} />
                </div>
                {/* Font type */}
                <div
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <div>
                    <div
                      style={{ fontFamily: F.body, fontSize: 14, fontWeight: 700, color: C.text }}
                    >
                      Tipus de lletra
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {[
                      { k: "impremta", l: "Impremta" },
                      { k: "lligada", l: "Lligada" },
                    ].map(({ k, l }) => (
                      <button
                        key={k}
                        onClick={() => saveCfg({ fontType: k as "lligada" | "impremta" })}
                        style={{
                          padding: "7px 14px",
                          borderRadius: 10,
                          border: `1.5px solid ${cfg.fontType === k ? C.secondary : C.border}`,
                          background: cfg.fontType === k ? C.secondarySoft : "transparent",
                          fontFamily: k === "lligada" ? F.cursive : F.body,
                          fontWeight: 700,
                          fontSize: 13,
                          color: cfg.fontType === k ? C.secondaryDark : C.textLight,
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Font size */}
                <div
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <div style={{ fontFamily: F.body, fontSize: 14, fontWeight: 700, color: C.text }}>
                    Mida de lletra
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                      onClick={() => saveCfg({ fontSize: Math.max(14, (cfg.fontSize || 22) - 2) })}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        border: `1.5px solid ${C.border}`,
                        background: C.card,
                        cursor: "pointer",
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
                        fontFamily: F.display,
                        fontSize: 16,
                        fontWeight: 700,
                        color: C.text,
                        minWidth: 30,
                        textAlign: "center",
                      }}
                    >
                      {cfg.fontSize || 22}
                    </span>
                    <button
                      onClick={() => saveCfg({ fontSize: Math.min(40, (cfg.fontSize || 22) + 2) })}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        border: `1.5px solid ${C.border}`,
                        background: C.card,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: C.textLight,
                      }}
                    >
                      <I.tBig size={20} />
                    </button>
                  </div>
                </div>
                {/* Hide pct */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      marginBottom: 6,
                    }}
                  >
                    <div>
                      <div
                        style={{ fontFamily: F.body, fontSize: 14, fontWeight: 700, color: C.text }}
                      >
                        Paraules ocultes
                      </div>
                      <div
                        style={{
                          fontFamily: F.body,
                          fontSize: 12,
                          color: C.textMuted,
                          marginTop: 1,
                        }}
                      >
                        Percentatge de paraules que s'oculten
                      </div>
                    </div>
                    <span
                      style={{
                        fontFamily: F.display,
                        fontSize: 18,
                        fontWeight: 700,
                        color: C.primary,
                        flexShrink: 0,
                      }}
                    >
                      {sliderPct}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={100}
                    step={5}
                    value={sliderPct}
                    onChange={(e) => setSliderPct(Number(e.target.value))}
                    onMouseUp={() => commitHidePct(sliderPct)}
                    onTouchEnd={() => commitHidePct(sliderPct)}
                    style={{ width: "100%", accentColor: C.primary, height: 6, cursor: "pointer" }}
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontFamily: F.body,
                      fontSize: 11,
                      color: C.textMuted,
                      marginTop: 3,
                    }}
                  >
                    <span>20%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* PREVIEW */}
          {dictat.text.trim() && (
            <div
              style={{
                background: C.card,
                borderRadius: 18,
                boxShadow: C.shadow,
                border: `1px solid ${C.borderLight}`,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "14px 18px 8px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: F.display,
                    fontSize: 14,
                    fontWeight: 700,
                    color: C.textLight,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <I.eye size={16} /> Vista prèvia
                </span>
                <span style={{ fontFamily: F.body, fontSize: 11, color: C.textMuted }}>
                  Clica una paraula per ocultar-la<span className="hide-mobile"> o mostrar-la</span>
                </span>
              </div>
              <div style={{ padding: "8px 22px 22px" }}>
                <TokenRenderer
                  tokens={tokens}
                  hiddenSet={hiddenSet}
                  fontSize={cfg.fontSize || 22}
                  lletraPal={cfg.lletraPal}
                  fontType={cfg.fontType}
                  mode="preview"
                  onToggleWord={toggleWord}
                />
              </div>
            </div>
          )}

          {/* Delete link */}
          <button
            onClick={() => setShowDeleteModal(true)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: F.body,
              fontSize: 13,
              fontWeight: 600,
              color: C.textMuted,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "12px 0 0",
              transition: "color 0.2s",
              alignSelf: "center",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = C.error)}
            onMouseLeave={(e) => (e.currentTarget.style.color = C.textMuted)}
          >
            <I.trash size={14} /> Eliminar aquest dictat
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <ConfirmModal
          message="Aquesta acció no es pot desfer."
          onConfirm={() => {
            setShowDeleteModal(false);
            onDelete(dictat.id);
          }}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
      {showShareModal && dictat && (
        <ShareModal
          dictat={dictat}
          publicUrl={buildPublicDictatUrl({ origin: window.location.origin, dictatId: dictat.id })}
          onToggle={setPublicSharing}
          onClose={() => setShowShareModal(false)}
          onCopied={() => setToast("Enllaç copiat!")}
        />
      )}
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </div>
  );
}

interface ShareModalProps {
  dictat: Dictat;
  publicUrl: string;
  onToggle: (isPublic: boolean) => void;
  onClose: () => void;
  onCopied: () => void;
}

function ShareModal({ dictat, publicUrl, onToggle, onClose, onCopied }: ShareModalProps) {
  const copyLink = async () => {
    if (!dictat.isPublic) return;
    await navigator.clipboard.writeText(publicUrl);
    onCopied();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Compartir dictat"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(45,48,71,0.35)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: C.card,
          borderRadius: 18,
          padding: 24,
          boxShadow: C.shadowLg,
          maxWidth: 460,
          width: "100%",
          border: `1px solid ${C.borderLight}`,
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 18,
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: F.display,
                fontSize: 20,
                margin: 0,
                color: C.text,
              }}
            >
              Compartir dictat
            </h2>
            <p style={{ fontFamily: F.body, fontSize: 13, color: C.textMuted, margin: "4px 0 0" }}>
              Activa l'enllaç públic per practicar.
            </p>
          </div>
          <button
            aria-label="Tancar"
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontFamily: F.body,
              fontSize: 24,
              lineHeight: 1,
              color: C.textMuted,
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            padding: "12px 0",
            borderTop: `1px solid ${C.borderLight}`,
            borderBottom: `1px solid ${C.borderLight}`,
          }}
        >
          <div>
            <div style={{ fontFamily: F.body, fontSize: 14, fontWeight: 800, color: C.text }}>
              Enllaç públic
            </div>
            <div style={{ fontFamily: F.body, fontSize: 12, color: C.textMuted }}>
              {dictat.isPublic ? "Qualsevol persona amb l'enllaç pot practicar." : "Privat"}
            </div>
          </div>
          <Toggle ariaLabel="Activar enllaç públic" value={dictat.isPublic} onChange={onToggle} />
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
          <input
            readOnly
            aria-label="Enllaç públic"
            value={publicUrl}
            style={{
              flex: 1,
              minWidth: 0,
              border: `1.5px solid ${C.border}`,
              borderRadius: 10,
              padding: "10px 12px",
              fontFamily: F.body,
              fontSize: 13,
              color: dictat.isPublic ? C.text : C.textMuted,
              opacity: dictat.isPublic ? 1 : 0.55,
              background: dictat.isPublic ? C.card : C.bg,
            }}
          />
          <Btn
            variant="secondary"
            disabled={!dictat.isPublic}
            onClick={() => void copyLink()}
            style={{
              padding: "10px 14px",
              opacity: dictat.isPublic ? 1 : 0.5,
              cursor: dictat.isPublic ? "pointer" : "not-allowed",
            }}
          >
            Copiar
          </Btn>
        </div>
      </div>
    </div>
  );
}

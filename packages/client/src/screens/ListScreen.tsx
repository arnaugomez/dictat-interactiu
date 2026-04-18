import { useState } from "react";
import { C } from "../theme/colors";
import { F } from "../theme/fonts";
import { I } from "../components/Icons";
import { FloatingDeco, Btn, ConfirmModal } from "../components/ui";
import { DictatRepository } from "../data/repository";

interface ListScreenProps {
  onBack: () => void;
  onEdit: (id: string) => void;
  onPractice: (id: string) => void;
  onNew: () => void;
}

export default function ListScreen({ onBack, onEdit, onPractice, onNew }: ListScreenProps) {
  const [dictats, setDictats] = useState(DictatRepository.getAll());
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const confirmDelete = () => {
    if (deleteId) {
      DictatRepository.remove(deleteId);
      setDictats(DictatRepository.getAll());
    }
    setDeleteId(null);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "24px 16px",
        position: "relative",
      }}
    >
      <FloatingDeco />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 620,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <Btn variant="ghost" onClick={onBack} style={{ padding: "8px 14px", fontSize: 13 }}>
            <I.back size={18} /> Inici
          </Btn>
          <h2
            style={{
              fontFamily: F.display,
              fontSize: 22,
              fontWeight: 700,
              color: C.text,
              margin: 0,
              flex: 1,
              textAlign: "center",
            }}
          >
            Els meus dictats
          </h2>
          <Btn
            variant="primary"
            onClick={onNew}
            style={{ padding: "8px 16px", fontSize: 13, fontFamily: F.display }}
          >
            <I.plus size={16} /> Nou
          </Btn>
        </div>
        {dictats.length === 0 ? (
          <div
            style={{
              background: C.card,
              borderRadius: 20,
              boxShadow: C.shadow,
              border: `1px solid ${C.borderLight}`,
              padding: "48px 24px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
            <p style={{ fontFamily: F.body, fontSize: 16, color: C.textLight, margin: 0 }}>
              Encara no tens cap dictat guardat.
            </p>
            <p style={{ fontFamily: F.body, fontSize: 14, color: C.textMuted, marginTop: 8 }}>
              Crea'n un des de la pàgina d'inici o prem "Nou".
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {dictats.map((d) => (
              <div
                key={d.id}
                style={{
                  background: C.card,
                  borderRadius: 16,
                  boxShadow: C.shadow,
                  border: `1px solid ${C.borderLight}`,
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  transition: "box-shadow 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = C.shadowLg)}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = C.shadow)}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: F.body,
                      fontSize: 15,
                      fontWeight: 700,
                      color: C.text,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {d.title || "Dictat"}
                  </div>
                  <div
                    style={{ fontFamily: F.body, fontSize: 12, color: C.textMuted, marginTop: 3 }}
                  >
                    {new Date(d.updatedAt).toLocaleDateString("ca-ES", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    {d.config?.lletraPal && (
                      <span style={{ marginLeft: 8, color: C.accentDark, fontWeight: 700 }}>
                        ABC
                      </span>
                    )}
                    {d.config?.hidePct < 100 && (
                      <span style={{ marginLeft: 8, color: C.purple }}>{d.config.hidePct}%</span>
                    )}
                    {d.config?.fontType === "lligada" && (
                      <span style={{ marginLeft: 8, fontFamily: F.cursive, color: C.secondary }}>
                        Ll
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  <button
                    onClick={() => onEdit(d.id)}
                    title="Editar"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      border: "none",
                      background: C.secondarySoft,
                      color: C.secondaryDark,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <I.edit size={16} />
                  </button>
                  <button
                    onClick={() => onPractice(d.id)}
                    title="Practicar"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      border: "none",
                      background: C.primarySoft,
                      color: C.primary,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <I.play size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteId(d.id)}
                    title="Eliminar"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      border: "none",
                      background: `${C.error}12`,
                      color: C.error,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <I.trash size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {deleteId && (
        <ConfirmModal
          message="Aquesta acció no es pot desfer."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}

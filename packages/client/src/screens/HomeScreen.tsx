import { useState, useRef } from "react";
import { C } from "../theme/colors";
import { F } from "../theme/fonts";
import { I } from "../components/Icons";
import { FloatingDeco, Btn } from "../components/ui";
import { randomExample } from "../data/examples";

interface HomeScreenProps {
  onCreateDictat: (text: string) => void;
  onShowList: () => void;
}

export default function HomeScreen({ onCreateDictat, onShowList }: HomeScreenProps) {
  const [text, setText] = useState("");
  const textRef = useRef<HTMLTextAreaElement>(null);
  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        position: "relative",
      }}
    >
      <style>{`@media(max-width:480px){.example-btn{display:none!important}}`}</style>
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
        <div style={{ textAlign: "center", marginBottom: 4 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
              marginBottom: 6,
            }}
          >
            <I.sparkle fc={C.secondary} />
            <I.pencil size={26} stroke={C.primary} />
            <I.sparkle fc={C.purple} />
          </div>
          <h1
            style={{
              fontFamily: F.display,
              fontSize: "clamp(28px,5vw,38px)",
              fontWeight: 700,
              color: C.text,
              margin: 0,
            }}
          >
            Dictat Interactiu
          </h1>
          <p
            style={{
              fontFamily: F.body,
              fontSize: "clamp(15px,2.5vw,17px)",
              color: C.textLight,
              margin: "8px 0 0",
              lineHeight: 1.5,
            }}
          >
            Escriu el text del dictat i crea una activitat per als teus alumnes! ✨
          </p>
        </div>
        <div
          style={{
            background: C.card,
            borderRadius: 20,
            boxShadow: C.shadow,
            border: `1px solid ${C.borderLight}`,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <textarea
            ref={textRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escriu aquí el text del dictat..."
            rows={7}
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              resize: "vertical",
              padding: "22px 22px 16px",
              fontFamily: F.body,
              fontSize: 16,
              lineHeight: 1.7,
              color: C.text,
              background: "transparent",
              boxSizing: "border-box",
              minHeight: 180,
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0 16px 16px",
            }}
          >
            <span className="example-btn">
              <Btn
                variant="soft"
                color={C.accentDark}
                style={{
                  background: "linear-gradient(135deg,#FFD16618,#FFD16633)",
                  border: `1.5px solid ${C.accentDark}33`,
                  fontSize: 13,
                  padding: "8px 14px",
                }}
                onClick={() => {
                  setText(randomExample());
                  textRef.current?.focus();
                }}
              >
                <I.star size={15} fc={C.accentDark} /> Dictat d'exemple
              </Btn>
            </span>
            <Btn
              variant="primary"
              onClick={() => text.trim() && onCreateDictat(text.trim())}
              style={{
                opacity: text.trim() ? 1 : 0.45,
                pointerEvents: text.trim() ? "auto" : "none",
                fontFamily: F.display,
                fontSize: 15,
                padding: "11px 26px",
              }}
            >
              Crea el dictat 🚀
            </Btn>
          </div>
        </div>
        <button
          onClick={onShowList}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: F.body,
            fontSize: 14,
            fontWeight: 700,
            color: C.purple,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "8px 0",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = C.primaryDark)}
          onMouseLeave={(e) => (e.currentTarget.style.color = C.purple)}
        >
          <I.list size={16} /> Veure els dictats guardats
        </button>
        <div
          style={{
            textAlign: "center",
            fontFamily: F.body,
            fontSize: 12,
            color: C.textMuted,
            marginTop: 4,
          }}
        >
          Fet amb 💜 per a mestres i alumnes
        </div>
      </div>
    </div>
  );
}

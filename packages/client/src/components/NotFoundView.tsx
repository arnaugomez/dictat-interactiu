import type { CSSProperties, MouseEvent } from "react";
import { C } from "../theme/colors";
import { F } from "../theme/fonts";
import { I } from "./Icons";
import { FloatingDeco, Btn } from "./ui";

/**
 * Properties for {@link NotFoundView}.
 */
interface NotFoundViewProps {
  /** Optional message shown beneath the title. Falls back to a friendly default. */
  message?: string;
  /** Optional callback for the secondary "back" action. Hidden when not provided. */
  onBack?: () => void;
  /** Label for the back action. Defaults to "Tornar". */
  backLabel?: string;
}

/**
 * The visual configuration for each digit in the playful 404 mark.
 */
interface DigitStyle {
  ch: string;
  color: string;
  rotate: number;
  delay: number;
}

const digits: DigitStyle[] = [
  { ch: "4", color: C.primary, rotate: -8, delay: 0 },
  { ch: "0", color: C.secondary, rotate: 6, delay: 0.4 },
  { ch: "4", color: C.purple, rotate: -3, delay: 0.8 },
];

/**
 * Performs an SPA-style navigation to "/" while preserving the native anchor
 * behaviour for modifier-clicks (open in new tab, etc.).
 */
const goHome = (event: MouseEvent<HTMLAnchorElement>) => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
  event.preventDefault();
  window.history.pushState(null, "", "/");
  window.dispatchEvent(new PopStateEvent("popstate"));
};

const homeLinkStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  fontFamily: F.body,
  fontWeight: 700,
  fontSize: 14,
  borderRadius: 12,
  padding: "10px 18px",
  background: `linear-gradient(135deg,${C.primary},${C.primaryDark})`,
  color: "#fff",
  boxShadow: `0 3px 14px ${C.primary}44`,
  textDecoration: "none",
  transition: "transform 0.2s",
};

/**
 * A friendly empty-state used when a dictat cannot be found. Pairs a playful
 * animated 404 mark with a clear path back to either the previous screen or
 * the app home.
 */
export default function NotFoundView({ message, onBack, backLabel = "Tornar" }: NotFoundViewProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        position: "relative",
      }}
    >
      <FloatingDeco />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 460,
          width: "100%",
          background: C.card,
          borderRadius: 24,
          boxShadow: C.shadowLg,
          border: `1px solid ${C.borderLight}`,
          padding: "44px 32px 32px",
          textAlign: "center",
          animation: "slideD 0.3s ease",
        }}
      >
        <div
          aria-hidden
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 6,
            marginBottom: 18,
          }}
        >
          {digits.map((d, i) => (
            <span
              key={i}
              style={{
                display: "inline-block",
                transform: `rotate(${d.rotate}deg)`,
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  fontFamily: F.display,
                  fontSize: 96,
                  fontWeight: 700,
                  lineHeight: 1,
                  color: d.color,
                  textShadow: `0 6px 18px ${d.color}33`,
                  animation: `floatB 4s ease-in-out ${d.delay}s infinite alternate`,
                }}
              >
                {d.ch}
              </span>
            </span>
          ))}
        </div>
        <h1
          style={{
            fontFamily: F.display,
            fontSize: 22,
            fontWeight: 700,
            color: C.text,
            margin: "0 0 8px",
          }}
        >
          Aquest dictat s'ha despistat
        </h1>
        <p
          style={{
            fontFamily: F.body,
            fontSize: 14,
            color: C.textMuted,
            margin: "0 0 28px",
            lineHeight: 1.6,
          }}
        >
          {message ??
            "No hem trobat el dictat que buscaves. Potser s'ha mogut o l'enllaç ha caducat."}
        </p>
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {onBack && (
            <Btn variant="ghost" onClick={onBack} style={{ padding: "10px 18px" }}>
              <I.back size={18} /> {backLabel}
            </Btn>
          )}
          <a href="/" onClick={goHome} style={homeLinkStyle}>
            <I.home size={18} /> Anar a l'inici
          </a>
        </div>
      </div>
    </div>
  );
}

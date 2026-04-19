import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import { useState, useRef, useEffect } from "react";
import { C } from "../theme/colors";
import { F } from "../theme/fonts";
import { I } from "./Icons";

export const FloatingDeco = () => (
  <div
    style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}
  >
    {[
      { top: "6%", left: "4%", size: 55, color: C.accent, opacity: 0.16, d: 0 },
      { top: "12%", right: "7%", size: 40, color: C.pink, opacity: 0.13, d: 1.2 },
      { bottom: "18%", left: "2%", size: 32, color: C.secondary, opacity: 0.13, d: 2 },
      { bottom: "8%", right: "4%", size: 50, color: C.purple, opacity: 0.11, d: 0.6 },
      { top: "50%", right: "1%", size: 28, color: C.accent, opacity: 0.1, d: 1.8 },
    ].map((b, i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          ...(b.top != null && { top: b.top }),
          ...(b.bottom != null && { bottom: b.bottom }),
          ...(b.left != null && { left: b.left }),
          ...(b.right != null && { right: b.right }),
          width: b.size,
          height: b.size,
          borderRadius: "50%",
          background: b.color,
          opacity: b.opacity,
          animation: `floatB 6s ease-in-out ${b.d}s infinite alternate`,
        }}
      />
    ))}
  </div>
);

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "ghost" | "primary" | "secondary" | "soft";
  color?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export const Btn = ({ children, variant = "ghost", color, style, ...props }: BtnProps) => {
  const base: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    fontFamily: F.body,
    fontWeight: 700,
    fontSize: 14,
    borderRadius: 12,
    cursor: "pointer",
    transition: "all 0.2s",
    border: "none",
    padding: "10px 18px",
  };
  const v: Record<string, CSSProperties> = {
    primary: {
      background: `linear-gradient(135deg,${C.primary},${C.primaryDark})`,
      color: "#fff",
      boxShadow: `0 3px 14px ${C.primary}44`,
    },
    secondary: {
      background: `linear-gradient(135deg,${C.secondary},${C.secondaryDark})`,
      color: "#fff",
      boxShadow: `0 3px 14px ${C.secondary}44`,
    },
    ghost: {
      background: "transparent",
      color: color || C.textLight,
      border: `1.5px solid ${C.border}`,
    },
    soft: {
      background: color ? `${color}14` : C.primarySoft,
      color: color || C.primary,
      border: `1.5px solid ${color ? `${color}33` : C.primaryMid}`,
    },
  };
  return (
    <button style={{ ...base, ...v[variant], ...style }} {...props}>
      {children}
    </button>
  );
};

interface ToggleProps {
  value: boolean;
  onChange: (v: boolean) => void;
}

export const Toggle = ({ value, onChange }: ToggleProps) => (
  <button
    onClick={() => onChange(!value)}
    style={{
      width: 48,
      height: 28,
      borderRadius: 14,
      border: "none",
      background: value ? `linear-gradient(135deg,${C.secondary},${C.secondaryDark})` : C.border,
      cursor: "pointer",
      position: "relative",
      transition: "background 0.3s",
      flexShrink: 0,
    }}
  >
    <div
      style={{
        width: 22,
        height: 22,
        borderRadius: 11,
        background: "#fff",
        position: "absolute",
        top: 3,
        left: value ? 23 : 3,
        transition: "left 0.3s",
        boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
      }}
    />
  </button>
);

interface ConfirmModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal = ({ message, onConfirm, onCancel }: ConfirmModalProps) => (
  <div
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
      animation: "slideD 0.2s ease",
    }}
    onClick={onCancel}
  >
    <div
      style={{
        background: C.card,
        borderRadius: 20,
        padding: "28px 28px 20px",
        boxShadow: C.shadowLg,
        maxWidth: 380,
        width: "100%",
        border: `1px solid ${C.borderLight}`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ fontSize: 32, textAlign: "center", marginBottom: 8 }}>🗑️</div>
      <p
        style={{
          fontFamily: F.body,
          fontSize: 16,
          fontWeight: 700,
          color: C.text,
          textAlign: "center",
          margin: "0 0 4px",
        }}
      >
        Eliminar dictat?
      </p>
      <p
        style={{
          fontFamily: F.body,
          fontSize: 14,
          color: C.textMuted,
          textAlign: "center",
          margin: "0 0 20px",
          lineHeight: 1.5,
        }}
      >
        {message}
      </p>
      <div style={{ display: "flex", gap: 10 }}>
        <Btn variant="ghost" onClick={onCancel} style={{ flex: 1, justifyContent: "center" }}>
          Cancel·la
        </Btn>
        <button
          onClick={onConfirm}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            fontFamily: F.body,
            fontWeight: 700,
            fontSize: 14,
            borderRadius: 12,
            border: "none",
            padding: "10px 18px",
            cursor: "pointer",
            background: `linear-gradient(135deg,${C.error},#C62828)`,
            color: "#fff",
            boxShadow: `0 3px 14px ${C.error}44`,
          }}
        >
          <I.trash size={16} /> Eliminar
        </button>
      </div>
    </div>
  </div>
);

interface ToastProps {
  msg: string;
  onDone: () => void;
}

export const Toast = ({ msg, onDone }: ToastProps) => {
  useEffect(() => {
    const t = setTimeout(onDone, 2000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        zIndex: 1100,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          background: C.success,
          color: "#fff",
          fontFamily: F.body,
          fontWeight: 700,
          fontSize: 14,
          padding: "10px 24px",
          borderRadius: 14,
          boxShadow: C.shadowLg,
          animation: "toastIn 0.25s ease",
          display: "flex",
          alignItems: "center",
          gap: 8,
          pointerEvents: "auto",
        }}
      >
        <I.check size={16} /> {msg}
      </div>
    </div>
  );
};

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  options: DropdownOption[];
  onSelect: (value: string) => void;
  children: ReactNode;
}

export const Dropdown = ({ options, onSelect, children }: DropdownProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} style={{ position: "relative", display: "inline-flex" }}>
      <div onClick={() => setOpen(!open)}>{children}</div>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            right: 0,
            background: C.card,
            borderRadius: 14,
            boxShadow: C.shadowLg,
            border: `1px solid ${C.borderLight}`,
            minWidth: 200,
            zIndex: 100,
            overflow: "hidden",
            animation: "slideD 0.15s ease",
          }}
        >
          {options.map((o, i) => (
            <button
              key={i}
              onClick={() => {
                onSelect(o.value);
                setOpen(false);
              }}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "12px 18px",
                border: "none",
                background: "transparent",
                fontFamily: F.body,
                fontSize: 13,
                fontWeight: 600,
                color: C.text,
                cursor: "pointer",
                borderBottom: i < options.length - 1 ? `1px solid ${C.borderLight}` : "none",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = C.primarySoft)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

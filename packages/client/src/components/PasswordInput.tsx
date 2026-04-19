import { useState, type InputHTMLAttributes } from "react";
import { C } from "../theme/colors";
import { F } from "../theme/fonts";
import { I } from "./Icons";

interface PasswordInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "placeholder"
> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function PasswordInput({ value, onChange, style, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        style={{
          fontFamily: F.body,
          fontSize: 15,
          color: C.text,
          background: C.bg,
          border: `1.5px solid ${C.border}`,
          borderRadius: 12,
          padding: "11px 44px 11px 14px",
          outline: "none",
          width: "100%",
          boxSizing: "border-box",
          ...style,
        }}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        style={{
          position: "absolute",
          right: 10,
          top: "50%",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 4,
          color: C.textMuted,
          display: "flex",
          alignItems: "center",
        }}
      >
        {visible ? I.eyeOff({ size: 18 }) : I.eye({ size: 18 })}
      </button>
    </div>
  );
}

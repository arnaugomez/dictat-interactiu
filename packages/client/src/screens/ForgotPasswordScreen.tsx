import { useState } from "react";
import { C } from "../theme/colors";
import { F } from "../theme/fonts";
import { FloatingDeco, Btn } from "../components/ui";
import { forgotPassword } from "../api/auth";

interface ForgotPasswordScreenProps {
  onNavigate: (path: string) => void;
}

export default function ForgotPasswordScreen({ onNavigate }: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgotPassword({ email });
      setSuccess(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("No s'ha pogut enviar el correu. Torna-ho a intentar.");
      }
    } finally {
      setLoading(false);
    }
  };

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
          <div style={{ fontSize: 40, marginBottom: 10 }}>🔑</div>
          <h1
            style={{
              fontFamily: F.display,
              fontSize: "clamp(26px, 5vw, 34px)",
              fontWeight: 700,
              color: C.text,
              margin: 0,
            }}
          >
            Recuperar contrasenya
          </h1>
          <p
            style={{
              fontFamily: F.body,
              fontSize: "clamp(14px, 2.5vw, 16px)",
              color: C.textLight,
              margin: "8px 0 0",
            }}
          >
            T'enviarem un correu per restablir-la.
          </p>
        </div>

        <div
          style={{
            background: C.card,
            borderRadius: 20,
            boxShadow: C.shadow,
            border: `1px solid ${C.borderLight}`,
            padding: "28px 28px 24px",
          }}
        >
          {success ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 36 }}>📬</div>
              <p
                style={{
                  fontFamily: F.body,
                  fontSize: 15,
                  color: C.success,
                  background: C.successBg,
                  border: `1px solid ${C.success}33`,
                  borderRadius: 12,
                  padding: "14px 18px",
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                Hem enviat un correu amb instruccions per restablir la contrasenya.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label
                  style={{
                    fontFamily: F.body,
                    fontSize: 13,
                    fontWeight: 700,
                    color: C.textLight,
                  }}
                >
                  Correu electrònic
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@exemple.com"
                  required
                  style={{
                    fontFamily: F.body,
                    fontSize: 15,
                    color: C.text,
                    background: C.bg,
                    border: `1.5px solid ${C.border}`,
                    borderRadius: 12,
                    padding: "11px 14px",
                    outline: "none",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = C.primary)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = C.border)}
                />
              </div>

              {error && (
                <div
                  style={{
                    fontFamily: F.body,
                    fontSize: 14,
                    color: C.error,
                    background: C.errorBg,
                    border: `1px solid ${C.error}33`,
                    borderRadius: 10,
                    padding: "10px 14px",
                  }}
                >
                  {error}
                </div>
              )}

              <Btn
                type="submit"
                variant="primary"
                disabled={loading}
                style={{
                  width: "100%",
                  justifyContent: "center",
                  fontFamily: F.display,
                  fontSize: 16,
                  padding: "13px 20px",
                  marginTop: 4,
                  opacity: loading ? 0.65 : 1,
                }}
              >
                {loading ? "Enviant..." : "Enviar enllaç"}
              </Btn>
            </form>
          )}

          <div
            style={{
              marginTop: 20,
              paddingTop: 20,
              borderTop: `1px solid ${C.borderLight}`,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <button
              onClick={() => onNavigate("/")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: F.body,
                fontSize: 14,
                fontWeight: 700,
                color: C.textLight,
                padding: 0,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.primary)}
              onMouseLeave={(e) => (e.currentTarget.style.color = C.textLight)}
            >
              ← Tornar a l'inici de sessió
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

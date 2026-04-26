import { useState } from "react";
import { Effect } from "effect";
import { C } from "../theme/colors";
import { F } from "../theme/fonts";
import { FloatingDeco, Btn } from "../components/ui";
import { resetPassword } from "../api/auth";
import PasswordInput from "../components/PasswordInput";

interface ResetPasswordScreenProps {
  onNavigate: (path: string) => void;
}

export default function ResetPasswordScreen({ onNavigate }: ResetPasswordScreenProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const token = new URL(window.location.href).searchParams.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Enllaç de restabliment invàlid o caducat.");
      return;
    }

    if (newPassword.length < 8) {
      setError("La contrasenya ha de tenir almenys 8 caràcters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les contrasenyes no coincideixen.");
      return;
    }

    setLoading(true);
    try {
      await Effect.runPromise(resetPassword({ token, password: newPassword }));
      setSuccess(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("No s'ha pogut canviar la contrasenya. L'enllaç pot haver caducat.");
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
          <div style={{ fontSize: 40, marginBottom: 10 }}>🔒</div>
          <h1
            style={{
              fontFamily: F.display,
              fontSize: "clamp(26px, 5vw, 34px)",
              fontWeight: 700,
              color: C.text,
              margin: 0,
            }}
          >
            Nova contrasenya
          </h1>
          <p
            style={{
              fontFamily: F.body,
              fontSize: "clamp(14px, 2.5vw, 16px)",
              color: C.textLight,
              margin: "8px 0 0",
            }}
          >
            Tria una nova contrasenya per al teu compte.
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
                gap: 20,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 36 }}>✅</div>
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
                La contrasenya s'ha canviat correctament.
              </p>
              <Btn
                variant="primary"
                onClick={() => onNavigate("/")}
                style={{
                  justifyContent: "center",
                  fontFamily: F.display,
                  fontSize: 15,
                  padding: "12px 28px",
                }}
              >
                Anar a l'inici de sessió
              </Btn>
            </div>
          ) : (
            <>
              {!token && (
                <div
                  style={{
                    fontFamily: F.body,
                    fontSize: 14,
                    color: C.error,
                    background: C.errorBg,
                    border: `1px solid ${C.error}33`,
                    borderRadius: 10,
                    padding: "10px 14px",
                    marginBottom: 16,
                  }}
                >
                  Enllaç de restabliment invàlid o caducat.
                </div>
              )}
              <form
                onSubmit={handleSubmit}
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label
                    htmlFor="reset-password-new"
                    style={{
                      fontFamily: F.body,
                      fontSize: 13,
                      fontWeight: 700,
                      color: C.textLight,
                    }}
                  >
                    Nova contrasenya
                  </label>
                  <PasswordInput
                    id="reset-password-new"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    onFocus={(e) => (e.currentTarget.style.borderColor = C.primary)}
                    onBlur={(e) => (e.currentTarget.style.borderColor = C.border)}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label
                    htmlFor="reset-password-confirm"
                    style={{
                      fontFamily: F.body,
                      fontSize: 13,
                      fontWeight: 700,
                      color: C.textLight,
                    }}
                  >
                    Confirma la nova contrasenya
                  </label>
                  <PasswordInput
                    id="reset-password-confirm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
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
                  disabled={loading || !token}
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    fontFamily: F.display,
                    fontSize: 16,
                    padding: "13px 20px",
                    marginTop: 4,
                    opacity: loading || !token ? 0.65 : 1,
                  }}
                >
                  {loading ? "Canviant..." : "Canviar contrasenya"}
                </Btn>
              </form>

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
            </>
          )}
        </div>
      </div>
    </div>
  );
}

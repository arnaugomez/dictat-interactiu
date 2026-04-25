import { useState } from "react";
import { C } from "../theme/colors";
import { F } from "../theme/fonts";
import { FloatingDeco, Btn } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import PasswordInput from "../components/PasswordInput";

interface SignupScreenProps {
  onNavigate: (path: string) => void;
}

export default function SignupScreen({ onNavigate }: SignupScreenProps) {
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("La contrasenya ha de tenir almenys 8 caràcters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les contrasenyes no coincideixen.");
      return;
    }

    setLoading(true);
    try {
      await signup({ name, email, password });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error en crear el compte. Torna-ho a intentar.");
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
          <div style={{ fontSize: 40, marginBottom: 10 }}>🎉</div>
          <h1
            style={{
              fontFamily: F.display,
              fontSize: "clamp(26px, 5vw, 34px)",
              fontWeight: 700,
              color: C.text,
              margin: 0,
            }}
          >
            Crear compte
          </h1>
          <p
            style={{
              fontFamily: F.body,
              fontSize: "clamp(14px, 2.5vw, 16px)",
              color: C.textLight,
              margin: "8px 0 0",
            }}
          >
            Uneix-te i comença a crear dictats interactius!
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
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label
                htmlFor="signup-name"
                style={{
                  fontFamily: F.body,
                  fontSize: 13,
                  fontWeight: 700,
                  color: C.textLight,
                }}
              >
                Nom
              </label>
              <input
                id="signup-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="El teu nom"
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

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label
                htmlFor="signup-email"
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
                id="signup-email"
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

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label
                htmlFor="signup-password"
                style={{
                  fontFamily: F.body,
                  fontSize: 13,
                  fontWeight: 700,
                  color: C.textLight,
                }}
              >
                Contrasenya
              </label>
              <PasswordInput
                id="signup-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                onFocus={(e) => (e.currentTarget.style.borderColor = C.primary)}
                onBlur={(e) => (e.currentTarget.style.borderColor = C.border)}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label
                htmlFor="signup-confirm-password"
                style={{
                  fontFamily: F.body,
                  fontSize: 13,
                  fontWeight: 700,
                  color: C.textLight,
                }}
              >
                Confirma la contrasenya
              </label>
              <PasswordInput
                id="signup-confirm-password"
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
              {loading ? "Carregant..." : "Crear compte"}
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
                color: C.primary,
                padding: 0,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.primaryDark)}
              onMouseLeave={(e) => (e.currentTarget.style.color = C.primary)}
            >
              Ja tens compte? Inicia sessió
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

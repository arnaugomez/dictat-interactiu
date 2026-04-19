import { useState, useEffect, useCallback } from "react";
import { C } from "../theme/colors";
import { F } from "../theme/fonts";
import { FloatingDeco, Btn } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { resendVerification, verifyEmail } from "../api/auth";

interface VerifyEmailScreenProps {
  onLogout: () => void;
}

const COOLDOWN_SECONDS = 60;

export default function VerifyEmailScreen({ onLogout }: VerifyEmailScreenProps) {
  const { user, refreshUser } = useAuth();
  const [cooldown, setCooldown] = useState(0);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sendSuccess, setSendSuccess] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  // Auto-verify if token is in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) return;
    setVerifying(true);
    verifyEmail({ token })
      .then(() => setVerified(true))
      .catch(() => setSendError("El token de verificació no és vàlid o ha caducat."))
      .finally(() => setVerifying(false));
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = useCallback(async () => {
    if (cooldown > 0 || sending) return;
    setSendError("");
    setSendSuccess(false);
    setSending(true);
    try {
      await resendVerification();
      setSendSuccess(true);
      setCooldown(COOLDOWN_SECONDS);
    } catch (err) {
      if (err instanceof Error) {
        setSendError(err.message);
      } else {
        setSendError("No s'ha pogut reenviar el correu. Torna-ho a intentar.");
      }
    } finally {
      setSending(false);
    }
  }, [cooldown, sending]);

  if (verified) {
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
            <div style={{ fontSize: 52, marginBottom: 10 }}>✅</div>
            <h1
              style={{
                fontFamily: F.display,
                fontSize: "clamp(26px, 5vw, 34px)",
                fontWeight: 700,
                color: C.text,
                margin: 0,
              }}
            >
              Correu verificat!
            </h1>
          </div>

          <div
            style={{
              background: C.card,
              borderRadius: 20,
              boxShadow: C.shadow,
              border: `1px solid ${C.borderLight}`,
              padding: "28px 28px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontFamily: F.body,
                fontSize: 16,
                color: C.textLight,
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              El teu correu ha estat verificat correctament.
            </p>

            <Btn
              variant="primary"
              onClick={() => refreshUser()}
              style={{
                justifyContent: "center",
                fontFamily: F.display,
                fontSize: 15,
                padding: "12px 28px",
              }}
            >
              Anar a l&apos;inici
            </Btn>
          </div>
        </div>
      </div>
    );
  }

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
          <div style={{ fontSize: 52, marginBottom: 10 }}>✉️</div>
          <h1
            style={{
              fontFamily: F.display,
              fontSize: "clamp(26px, 5vw, 34px)",
              fontWeight: 700,
              color: C.text,
              margin: 0,
            }}
          >
            Verifica el teu correu
          </h1>
        </div>

        <div
          style={{
            background: C.card,
            borderRadius: 20,
            boxShadow: C.shadow,
            border: `1px solid ${C.borderLight}`,
            padding: "28px 28px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
            textAlign: "center",
          }}
        >
          {verifying ? (
            <p
              style={{
                fontFamily: F.body,
                fontSize: 16,
                color: C.primary,
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              Verificant el correu...
            </p>
          ) : (
            <p
              style={{
                fontFamily: F.body,
                fontSize: 16,
                color: C.textLight,
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              Hem enviat un correu de verificació a{" "}
              <strong style={{ color: C.text }}>{user ? user.email : ""}</strong>. Revisa la bústia
              d'entrada.
            </p>
          )}

          {sendSuccess && (
            <div
              style={{
                fontFamily: F.body,
                fontSize: 14,
                color: C.success,
                background: C.successBg,
                border: `1px solid ${C.success}33`,
                borderRadius: 10,
                padding: "10px 16px",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              Correu reenviat correctament!
            </div>
          )}

          {sendError && (
            <div
              style={{
                fontFamily: F.body,
                fontSize: 14,
                color: C.error,
                background: C.errorBg,
                border: `1px solid ${C.error}33`,
                borderRadius: 10,
                padding: "10px 16px",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              {sendError}
            </div>
          )}

          <Btn
            variant="secondary"
            onClick={handleResend}
            disabled={cooldown > 0 || sending}
            style={{
              justifyContent: "center",
              fontFamily: F.display,
              fontSize: 15,
              padding: "12px 28px",
              opacity: cooldown > 0 || sending ? 0.65 : 1,
              cursor: cooldown > 0 || sending ? "not-allowed" : "pointer",
            }}
          >
            {sending
              ? "Enviant..."
              : cooldown > 0
                ? `Reenviar correu (${cooldown}s)`
                : "Reenviar correu"}
          </Btn>

          <div
            style={{
              paddingTop: 12,
              borderTop: `1px solid ${C.borderLight}`,
              width: "100%",
            }}
          >
            <button
              onClick={onLogout}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: F.body,
                fontSize: 14,
                fontWeight: 700,
                color: C.textMuted,
                padding: 0,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.error)}
              onMouseLeave={(e) => (e.currentTarget.style.color = C.textMuted)}
            >
              Tancar sessió
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

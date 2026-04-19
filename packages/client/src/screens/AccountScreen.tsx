import { useState, useCallback } from "react";
import { C } from "../theme/colors";
import { F } from "../theme/fonts";
import { I } from "../components/Icons";
import { FloatingDeco, Btn, Toast, ConfirmModal } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { updateProfile, changePassword, deleteAccount } from "../api/account";
import PasswordInput from "../components/PasswordInput";

interface AccountScreenProps {
  onBack: () => void;
}

export default function AccountScreen({ onBack }: AccountScreenProps) {
  const { user, setUser, logout } = useAuth();

  // Name section
  const [name, setName] = useState(user ? user.name : "");
  const [savingName, setSavingName] = useState(false);

  // Password section
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Delete section
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Toast
  const [toast, setToast] = useState("");

  const handleSaveName = useCallback(async () => {
    if (!name.trim()) return;
    setSavingName(true);
    try {
      const result = await updateProfile({ name: name.trim() });
      setUser(result.user);
      setToast("Nom desat correctament.");
    } catch (err) {
      if (err instanceof Error) {
        setToast(err.message);
      } else {
        setToast("No s'ha pogut desar el nom.");
      }
    } finally {
      setSavingName(false);
    }
  }, [name, setUser]);

  const handleChangePassword = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setPasswordError("");

      if (newPassword.length < 8) {
        setPasswordError("La nova contrasenya ha de tenir almenys 8 caràcters.");
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setPasswordError("Les contrasenyes no coincideixen.");
        return;
      }

      setSavingPassword(true);
      try {
        await changePassword({ currentPassword, newPassword });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setToast("Contrasenya canviada correctament.");
      } catch (err) {
        if (err instanceof Error) {
          setPasswordError(err.message);
        } else {
          setPasswordError("No s'ha pogut canviar la contrasenya.");
        }
      } finally {
        setSavingPassword(false);
      }
    },
    [currentPassword, newPassword, confirmNewPassword],
  );

  const handleDeleteAccount = useCallback(async () => {
    setDeletingAccount(true);
    try {
      await deleteAccount();
      await logout();
    } catch {
      setToast("No s'ha pogut eliminar el compte. Torna-ho a intentar.");
      setDeletingAccount(false);
    }
  }, [logout]);

  const inputStyle: React.CSSProperties = {
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
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: F.body,
    fontSize: 13,
    fontWeight: 700,
    color: C.textLight,
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontFamily: F.display,
    fontSize: 18,
    fontWeight: 700,
    color: C.text,
    margin: "0 0 16px",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "24px 16px 48px",
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
          gap: 20,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <button
            onClick={onBack}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: C.textLight,
              display: "flex",
              alignItems: "center",
              padding: 4,
              borderRadius: 8,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = C.primary)}
            onMouseLeave={(e) => (e.currentTarget.style.color = C.textLight)}
          >
            <I.back size={22} />
          </button>
          <div>
            <h1
              style={{
                fontFamily: F.display,
                fontSize: "clamp(22px, 4vw, 30px)",
                fontWeight: 700,
                color: C.text,
                margin: 0,
              }}
            >
              El meu compte
            </h1>
            {user && (
              <p
                style={{
                  fontFamily: F.body,
                  fontSize: 13,
                  color: C.textMuted,
                  margin: "2px 0 0",
                }}
              >
                {user.email}
              </p>
            )}
          </div>
        </div>

        {/* Name section */}
        <div
          style={{
            background: C.card,
            borderRadius: 20,
            boxShadow: C.shadow,
            border: `1px solid ${C.borderLight}`,
            padding: "24px 24px 20px",
          }}
        >
          <h2 style={sectionTitleStyle}>Nom</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={labelStyle}>Nom</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="El teu nom"
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = C.primary)}
                onBlur={(e) => (e.currentTarget.style.borderColor = C.border)}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Btn
                variant="primary"
                onClick={handleSaveName}
                disabled={savingName || !name.trim()}
                style={{
                  fontFamily: F.display,
                  fontSize: 14,
                  padding: "10px 22px",
                  opacity: savingName || !name.trim() ? 0.65 : 1,
                }}
              >
                <I.save size={15} />
                {savingName ? "Desant..." : "Desar"}
              </Btn>
            </div>
          </div>
        </div>

        {/* Password section */}
        <div
          style={{
            background: C.card,
            borderRadius: 20,
            boxShadow: C.shadow,
            border: `1px solid ${C.borderLight}`,
            padding: "24px 24px 20px",
          }}
        >
          <h2 style={sectionTitleStyle}>Canviar contrasenya</h2>
          <form
            onSubmit={handleChangePassword}
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={labelStyle}>Contrasenya actual</label>
              <PasswordInput
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                onFocus={(e) => (e.currentTarget.style.borderColor = C.primary)}
                onBlur={(e) => (e.currentTarget.style.borderColor = C.border)}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={labelStyle}>Nova contrasenya</label>
              <PasswordInput
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                onFocus={(e) => (e.currentTarget.style.borderColor = C.primary)}
                onBlur={(e) => (e.currentTarget.style.borderColor = C.border)}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={labelStyle}>Confirma la nova contrasenya</label>
              <PasswordInput
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                onFocus={(e) => (e.currentTarget.style.borderColor = C.primary)}
                onBlur={(e) => (e.currentTarget.style.borderColor = C.border)}
              />
            </div>

            {passwordError && (
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
                {passwordError}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Btn
                type="submit"
                variant="secondary"
                disabled={savingPassword}
                style={{
                  fontFamily: F.display,
                  fontSize: 14,
                  padding: "10px 22px",
                  opacity: savingPassword ? 0.65 : 1,
                }}
              >
                {savingPassword ? "Canviant..." : "Canviar contrasenya"}
              </Btn>
            </div>
          </form>
        </div>

        {/* Delete account section */}
        <div
          style={{
            background: C.card,
            borderRadius: 20,
            boxShadow: C.shadow,
            border: `1px solid ${C.error}22`,
            padding: "24px 24px 20px",
          }}
        >
          <h2
            style={{
              ...sectionTitleStyle,
              color: C.error,
            }}
          >
            Zona de perill
          </h2>
          <p
            style={{
              fontFamily: F.body,
              fontSize: 14,
              color: C.textLight,
              margin: "0 0 16px",
              lineHeight: 1.5,
            }}
          >
            Un cop eliminat el compte, totes les dades es perdran permanentment i no es podran
            recuperar.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={deletingAccount}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontFamily: F.body,
              fontWeight: 700,
              fontSize: 14,
              borderRadius: 12,
              border: "none",
              padding: "10px 20px",
              cursor: "pointer",
              background: `linear-gradient(135deg,${C.error},#C62828)`,
              color: "#fff",
              boxShadow: `0 3px 14px ${C.error}44`,
              opacity: deletingAccount ? 0.65 : 1,
            }}
          >
            <I.trash size={16} />
            Eliminar compte
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={() => {
            logout();
            window.history.pushState(null, "", "/");
            window.dispatchEvent(new PopStateEvent("popstate"));
          }}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: F.body,
            fontSize: 14,
            fontWeight: 700,
            color: C.textMuted,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "16px 0 0",
            alignSelf: "center",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = C.primary)}
          onMouseLeave={(e) => (e.currentTarget.style.color = C.textMuted)}
        >
          <I.logout size={16} /> Tancar sessió
        </button>
      </div>

      {showDeleteModal && (
        <ConfirmModal
          message="Segur que vols eliminar el teu compte? Aquesta acció no es pot desfer i es perdran totes les dades."
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      {toast && <Toast msg={toast} onDone={() => setToast("")} />}
    </div>
  );
}

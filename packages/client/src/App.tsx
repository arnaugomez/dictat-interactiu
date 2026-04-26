import { useState, useEffect, useCallback } from "react";
import { Effect } from "effect";
import GlobalStyles from "./components/GlobalStyles";
import HomeScreen from "./screens/HomeScreen";
import ListScreen from "./screens/ListScreen";
import EditScreen from "./screens/EditScreen";
import PracticeScreen from "./screens/PracticeScreen";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import VerifyEmailScreen from "./screens/VerifyEmailScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import ResetPasswordScreen from "./screens/ResetPasswordScreen";
import AccountScreen from "./screens/AccountScreen";
import { useAuth } from "./context/AuthContext";
import { createDictat, deleteDictat } from "./api/dictats";
import { tokenize, computeHiddenIndices } from "./utils/tokenizer";
import { C } from "./theme/colors";
import { F } from "./theme/fonts";

function parseRoute(): { path: string; id: string | null } {
  const pathname = window.location.pathname;
  const editMatch = pathname.match(/^\/edit\/(.+)$/);
  if (editMatch) return { path: "/edit", id: editMatch[1] };
  const practiceMatch = pathname.match(/^\/practice\/(.+)$/);
  if (practiceMatch) return { path: "/practice", id: practiceMatch[1] };
  const publicPracticeMatch = pathname.match(/^\/public\/practice\/(.+)$/);
  if (publicPracticeMatch) return { path: "/public/practice", id: publicPracticeMatch[1] };
  return { path: pathname || "/", id: null };
}

function navigate(path: string) {
  window.history.pushState(null, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ fontFamily: F.display, fontSize: 24, color: C.textLight }}>Carregant...</div>
    </div>
  );
}

function AppHeader(props: { onAccount: () => void; onLogout: () => void; userName: string }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "10px 16px",
      }}
    >
      <button
        onClick={props.onAccount}
        style={{
          background: C.card,
          border: `1.5px solid ${C.border}`,
          borderRadius: 10,
          padding: "6px 12px",
          fontFamily: F.body,
          fontSize: 13,
          fontWeight: 700,
          color: C.textLight,
          cursor: "pointer",
        }}
      >
        {props.userName}
      </button>
      <button
        onClick={props.onLogout}
        style={{
          background: "transparent",
          border: "none",
          fontFamily: F.body,
          fontSize: 12,
          fontWeight: 700,
          color: C.textMuted,
          cursor: "pointer",
        }}
      >
        Sortir
      </button>
    </div>
  );
}

export default function App() {
  const { user, isLoading, isAuthenticated, isVerified, logout } = useAuth();
  const [route, setRoute] = useState(parseRoute);

  useEffect(() => {
    const onPopState = () => setRoute(parseRoute());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const nav = {
    home: () => navigate("/"),
    list: () => navigate("/list"),
    edit: (id: string) => navigate(`/edit/${id}`),
    practice: (id: string) => navigate(`/practice/${id}`),
    createFromText: async (text: string) => {
      const tokens = tokenize(text);
      const hiddenIndices = computeHiddenIndices(tokens, 100);
      const { dictat } = await Effect.runPromise(createDictat({ text, hiddenIndices }));
      navigate(`/edit/${dictat.id}`);
    },
    createNew: async () => {
      const { dictat } = await Effect.runPromise(createDictat({ text: "" }));
      navigate(`/edit/${dictat.id}`);
    },
    deleteDictat: async (id: string) => {
      await Effect.runPromise(deleteDictat(id));
      navigate("/list");
    },
  };

  const handleLogout = useCallback(async () => {
    await logout();
    navigate("/");
  }, [logout]);

  if (isLoading) {
    return (
      <>
        <GlobalStyles />
        <LoadingScreen />
      </>
    );
  }

  if (route.path === "/public/practice" && route.id !== null) {
    const backProps =
      isAuthenticated && isVerified ? { onBack: () => nav.edit(route.id ?? "") } : {};
    return (
      <>
        <GlobalStyles />
        <PracticeScreen
          key={`${route.id}_public`}
          dictatId={route.id}
          mode="public"
          {...backProps}
        />
      </>
    );
  }

  // Unauthenticated routes
  if (!isAuthenticated) {
    return (
      <>
        <GlobalStyles />
        {route.path === "/signup" && <SignupScreen onNavigate={navigate} />}
        {route.path === "/forgot-password" && <ForgotPasswordScreen onNavigate={navigate} />}
        {route.path === "/reset-password" && <ResetPasswordScreen onNavigate={navigate} />}
        {route.path !== "/signup" &&
          route.path !== "/forgot-password" &&
          route.path !== "/reset-password" && <LoginScreen onNavigate={navigate} />}
      </>
    );
  }

  // Authenticated but unverified
  if (!isVerified) {
    return (
      <>
        <GlobalStyles />
        <VerifyEmailScreen onLogout={handleLogout} />
      </>
    );
  }

  // Authenticated and verified
  const userName = user?.name ?? "Usuari";
  return (
    <>
      <GlobalStyles />
      {route.path === "/" && (
        <AppHeader
          onAccount={() => navigate("/account")}
          onLogout={handleLogout}
          userName={userName}
        />
      )}
      {route.path === "/list" && (
        <ListScreen
          onBack={nav.home}
          onEdit={nav.edit}
          onPractice={nav.practice}
          onNew={nav.createNew}
        />
      )}
      {route.path === "/edit" && route.id !== null && (
        <EditScreen
          key={route.id}
          dictatId={route.id}
          onBack={nav.list}
          onPractice={nav.practice}
          onDelete={nav.deleteDictat}
        />
      )}
      {route.path === "/practice" && route.id !== null && (
        <PracticeScreen
          key={route.id + "_p"}
          dictatId={route.id}
          onBack={() => nav.edit(route.id ?? "")}
        />
      )}
      {route.path === "/account" && <AccountScreen onBack={nav.home} />}
      {route.path === "/" && (
        <HomeScreen onCreateDictat={nav.createFromText} onShowList={nav.list} />
      )}
    </>
  );
}

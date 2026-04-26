import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { Effect } from "effect";
import * as authApi from "../api/auth";

interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: number;
  updatedAt: number;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isVerified: boolean;
  login: (params: { email: string; password: string }) => Promise<void>;
  signup: (params: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const { user: fetchedUser } = await Effect.runPromise(authApi.getMe());
      setUser(fetchedUser);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  const login = useCallback(async (params: { email: string; password: string }) => {
    const { user: loggedInUser } = await Effect.runPromise(authApi.login(params));
    setUser(loggedInUser);
  }, []);

  const signup = useCallback(async (params: { name: string; email: string; password: string }) => {
    const { user: newUser } = await Effect.runPromise(authApi.signup(params));
    setUser(newUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      await Effect.runPromise(authApi.logout());
    } catch {
      // Ignore logout errors
    }
    setUser(null);
  }, []);

  return (
    <AuthContext
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        isVerified: user !== null && user.emailVerified,
        login,
        signup,
        logout,
        refreshUser,
        setUser,
      }}
    >
      {children}
    </AuthContext>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

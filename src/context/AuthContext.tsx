import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import type { AppRole, AuthUser } from "../types";

const TOKEN_KEY = "edustream_token";
const USER_KEY = "edustream_user";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: AppRole) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem(USER_KEY);
    return saved ? JSON.parse(saved) as AuthUser : null;
  });
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));
  const [error, setError] = useState<string | null>(null);

  const finishSession = (nextUser: AuthUser, token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
    setError(null);
  };

  useEffect(() => {
    const handleUnauthorized = () => {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setUser(null);
      setLoading(false);
      setError("Tu sesión expiró. Inicia sesión nuevamente.");
      navigate("/login", { replace: true, state: { message: "Tu sesión expiró. Inicia sesión nuevamente." } });
    };
    window.addEventListener("edustream:unauthorized", handleUnauthorized);
    if (localStorage.getItem(TOKEN_KEY)) {
      authService.me().then(({ user: currentUser }) => {
        localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
        setUser(currentUser);
      }).catch(handleUnauthorized).finally(() => setLoading(false));
    }
    return () => window.removeEventListener("edustream:unauthorized", handleUnauthorized);
  }, [navigate]);

  const value = useMemo<AuthContextValue>(() => ({
    user, loading, error,
    login: async (email, password) => {
      setLoading(true); setError(null);
      try { const result = await authService.login(email, password); finishSession(result.user, result.token); }
      catch (reason) { const message = reason instanceof Error ? reason.message : "No se pudo iniciar sesión."; setError(message); throw reason; }
      finally { setLoading(false); }
    },
    register: async (name, email, password, role) => {
      setLoading(true); setError(null);
      try { const result = await authService.register(name, email, password, role); finishSession(result.user, result.token); }
      catch (reason) { const message = reason instanceof Error ? reason.message : "No se pudo registrar la cuenta."; setError(message); throw reason; }
      finally { setLoading(false); }
    },
    logout: () => {
      localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); setUser(null); navigate("/");
    },
    clearError: () => setError(null),
  }), [error, loading, navigate, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe utilizarse dentro de AuthProvider.");
  return context;
}

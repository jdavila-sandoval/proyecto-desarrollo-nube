import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { AppRole } from "../types";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="route-state">Verificando sesión...</div>;
  return user ? <>{children}</> : <Navigate to="/login" replace state={{ from: location.pathname, message: "Inicia sesión para continuar." }} />;
}

export function GuestRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="route-state">Cargando...</div>;
  return user ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}

export function RoleRoute({ role, children }: { role: AppRole; children: ReactNode }) {
  const { user } = useAuth();
  return user?.role === role ? <>{children}</> : <Navigate to="/403" replace />;
}

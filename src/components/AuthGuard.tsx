import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

const isAuthenticated = true;

export function AuthGuard({ children }: { children: ReactNode }) {
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import type { AppRole } from "../types";

export function Can({ role, children }: { role: AppRole; children: ReactNode }) {
  const { user } = useAuth();
  return user?.role === role ? <>{children}</> : null;
}

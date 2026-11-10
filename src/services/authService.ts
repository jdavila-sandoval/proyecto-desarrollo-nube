import type { AuthResponse, AuthUser, AppRole } from "../types";
import { apiRequest } from "./apiClient";

export const authService = {
  login: (email: string, password: string) =>
    apiRequest<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  register: (name: string, email: string, password: string, role: AppRole) =>
    apiRequest<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify({ name, email, password, role }) }),
  me: () => apiRequest<{ user: AuthUser }>("/auth/me"),
};

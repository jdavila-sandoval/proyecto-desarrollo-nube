import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FormField } from "../components/FormField";
import { Logo } from "../components/Logo";
import { Notification } from "../components/Notification";
import { useAuth } from "../context/AuthContext";
import type { NotificationState, RegisterFormData, UserRole } from "../types";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, error, loading, clearError } = useAuth();
  const [role, setRole] = useState<UserRole>("Alumno");
  const [form, setForm] = useState<RegisterFormData>({ name: "", institutionId: "", email: "", password: "", confirmPassword: "", acceptedTerms: false });
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const update = (field: keyof RegisterFormData, value: string | boolean) => setForm({ ...form, [field]: value });
  const submit = async (event: FormEvent) => {
    event.preventDefault(); clearError();
    if (!form.name || !form.email || !form.password || !form.institutionId) return setNotification({ type: "error", message: "Completa los campos obligatorios." });
    if (form.password.length < 8) return setNotification({ type: "error", message: "La contraseña debe tener al menos 8 caracteres." });
    if (form.password !== form.confirmPassword) return setNotification({ type: "error", message: "Las contraseñas no coinciden." });
    if (!form.acceptedTerms) return setNotification({ type: "error", message: "Acepta los términos para crear tu cuenta." });
    try { await register(form.name, form.email, form.password, role === "Alumno" ? "alumno" : "docente"); navigate("/dashboard", { replace: true }); } catch { setNotification(null); }
  };
  return <div className="auth-page register-page"><div className="auth-decoration auth-decoration-one" /><div className="auth-decoration auth-decoration-two" /><div className="auth-shell"><Logo /><section className="auth-card register-card"><div className="auth-heading"><div className="auth-icon">✦</div><h1>Crea tu cuenta</h1><p>Forma parte de la comunidad que aprende compartiendo.</p></div>{(notification || error) && <Notification notification={notification ?? { type: "error", message: error ?? "" }} />}<div className="role-tabs" role="tablist"><button className={role === "Alumno" ? "active" : ""} type="button" onClick={() => setRole("Alumno")}>Soy Alumno</button><button className={role === "Profesor" ? "active" : ""} type="button" onClick={() => setRole("Profesor")}>Soy Profesor</button></div><form onSubmit={submit}><div className="form-row"><FormField label="Nombre completo" id="name" placeholder="Tu nombre" value={form.name} onChange={(e) => update("name", e.target.value)} /><FormField label="Matrícula / ID institucional" id="institutionId" placeholder="Ej. 123456" value={form.institutionId} onChange={(e) => update("institutionId", e.target.value)} /></div><FormField label="Correo universitario" id="register-email" type="email"   placeholder="correo@edustream.mx" value={form.email} onChange={(e) => update("email", e.target.value)} /><div className="form-row"><FormField label="Contraseña" id="register-password" type="password" placeholder="Mínimo 8 caracteres" value={form.password} onChange={(e) => update("password", e.target.value)} /><FormField label="Confirmar Contraseña" id="confirm-password" type="password" placeholder="Repite tu contraseña" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} /></div><label className="check-label terms-label"><input type="checkbox" checked={form.acceptedTerms} onChange={(e) => update("acceptedTerms", e.target.checked)} /> Acepto los <a href="#terms">términos de uso</a> y el código de conducta académico.</label><button className="button button-primary submit-button" type="submit" disabled={loading}>{loading ? "Creando cuenta..." : "Crear Cuenta"} <span>→</span></button></form><p className="auth-switch">¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p></section><Link className="back-home" to="/">← Volver al inicio</Link></div></div>;
}

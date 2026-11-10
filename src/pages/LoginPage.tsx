import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FormField } from "../components/FormField";
import { Logo } from "../components/Logo";
import { Notification } from "../components/Notification";
import { useAuth } from "../context/AuthContext";
import type { LoginFormData, NotificationState } from "../types";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error, loading, clearError } = useAuth();
  const [form, setForm] = useState<LoginFormData>({ email: "", password: "", remember: false });
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState<NotificationState | null>(location.state?.message ? { type: "error", message: location.state.message } : null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    clearError();
    if (!form.email || !form.password) {
      setNotification({ type: "error", message: "Completa tu correo y contraseña para continuar." });
      return;
    }
    try {
      await login(form.email, form.password);
      setNotification({ type: "success", message: "Bienvenido de nuevo. Redirigiendo..." });
      const destination = location.state?.from || "/dashboard";
      window.setTimeout(() => navigate(destination, { replace: true }), 500);
    } catch {
      setNotification(null);
    }
  };

  return <div className="auth-page"><div className="auth-decoration auth-decoration-one" /><div className="auth-decoration auth-decoration-two" /><div className="auth-shell"><Logo /><section className="auth-card"><div className="auth-heading"><div className="auth-icon">↗</div><h1>Iniciar Sesión</h1><p>Qué bueno verte de nuevo. Ingresa a tu espacio de aprendizaje.</p></div>{(notification || error) && <Notification notification={notification ?? { type: "error", message: error ?? "" }} />}<form onSubmit={submit}><FormField label="Correo Institucional" id="email" type="email"   placeholder="correo@edustream.mx" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /><FormField label="Contraseña" id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}><button className="password-toggle" type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Ocultar" : "Mostrar"}</button></FormField><div className="form-options"><label className="check-label"><input type="checkbox" checked={form.remember} onChange={(e) => setForm({ ...form, remember: e.target.checked })} /> Recordar sesión</label><a href="#forgot">Olvidé mi contraseña</a></div><button className="button button-primary submit-button" type="submit" disabled={loading}>{loading ? "Ingresando..." : "Ingresar"} <span>→</span></button></form><p className="auth-switch">¿Aún no tienes cuenta? <Link to="/register">Regístrate aquí</Link></p></section><Link className="back-home" to="/">← Volver al inicio</Link></div></div>;
}

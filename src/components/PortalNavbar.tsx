import { useState } from "react";
import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { useAuth } from "../context/AuthContext";

export function PortalNavbar({
  role,
  onRoleChange,
}: {
  role: "Alumno" | "Docente";
  onRoleChange: (role: "Alumno" | "Docente") => void;
}) {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  return (
    <header className="portal-header">
      <div className="portal-nav container">
        <Logo />
        <div className="global-search">
          <span>⌕</span>
          <input
            placeholder="Buscar cursos, videos o materias..."
            aria-label="Buscar en el portal"
          />
        </div>
        <div className="role-toggle" aria-label="Rol actual">
          <span className="profile-role-label">{user?.role === "docente" ? "Vista Docente" : "Vista Alumno"}</span>
        </div>
        <div className="profile-wrap">
          <button
            className="profile-button"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <span className="profile-avatar">{user?.name.slice(0, 2).toUpperCase() ?? "US"}</span>
            <span className="profile-name">
              {user?.name ?? "Usuario"}<small>{user?.role === "docente" ? "Docente" : "Alumno"}</small>
            </span>
            <span>⌄</span>
          </button>
          {profileOpen && (
            <div className="profile-menu">
              <Link to="/">Ir a inicio</Link>
              <button onClick={logout}>Cerrar sesión</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

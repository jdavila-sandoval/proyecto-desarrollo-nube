import { Link } from "react-router-dom";
import { Logo } from "./Logo";

export function Navbar() {
  return (
    <header className="site-header">
      <nav className="nav container" aria-label="Navegación principal">
        <Logo />
        <div className="nav-links">
          <a href="/#features">Características</a>
          <a href="/#catalog">Catálogo Demo</a>
          <a href="/#teachers">Docentes</a>
        </div>
        <div className="nav-actions">
          <Link className="button button-ghost" to="/login">
            Iniciar Sesión
          </Link>
          <Link className="button button-primary button-small" to="/register">
            Registrarse <span aria-hidden="true">→</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}

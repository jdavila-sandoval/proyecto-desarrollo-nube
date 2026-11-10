import { Link } from "react-router-dom";

export function AccessDeniedPage() {
  return <div className="route-page"><div><strong>403</strong><h1>Acceso denegado</h1><p>No tienes permisos para consultar esta sección.</p><Link className="button button-primary" to="/dashboard">Volver al dashboard</Link></div></div>;
}

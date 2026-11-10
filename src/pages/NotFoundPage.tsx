import { Link } from "react-router-dom";

export function NotFoundPage() {
  return <div className="route-page"><div><strong>404</strong><h1>Página no encontrada</h1><p>La dirección que buscas no existe.</p><Link className="button button-primary" to="/">Volver al inicio</Link></div></div>;
}

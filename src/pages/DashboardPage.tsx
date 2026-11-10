import { Link } from "react-router-dom";
import { PortalLayout, usePortalRole } from "../components/PortalLayout";
import { StatCard } from "../components/ui/StatCard";
import { useVideos } from "../hooks/useVideos";
import { useAuth } from "../context/AuthContext";
import type { CourseMetric } from "../types";

const metrics: CourseMetric[] = [
  { label: "Videos vistos este mes", value: "18", detail: "+12% vs. mes anterior", icon: "▶", tone: "purple" },
  { label: "Horas de estudio acumuladas", value: "14.5", detail: "Tu mejor mes hasta ahora", icon: "◷", tone: "orange" },
  { label: "Materias activas", value: "5", detail: "2 nuevas esta semana", icon: "▦", tone: "blue" },
  { label: "Notas guardadas", value: "32", detail: "4 desde tu última visita", icon: "✦", tone: "green" },
];

export function DashboardPage() {
  const [role, setRole] = usePortalRole();
  const { user } = useAuth();
  const { videos, loading, error } = useVideos();
  return (
    <PortalLayout role={role} onRoleChange={setRole}>
      <div className="portal-container container">
        <div className="portal-welcome">
          <div><div className="eyebrow">DOMINGO, 18 DE OCTUBRE DE 2026</div><h1>Buen día, José <span>✦</span></h1><p>Continúa donde lo dejaste y descubre algo nuevo hoy.</p></div>
          {user?.role === "docente" && <div className="portal-welcome-actions"><Link className="button button-secondary" to="/manage-videos">Gestionar videos</Link><Link className="button button-primary" to="/upload-video">＋ Subir nuevo video</Link></div>}
        </div>
        <div className="stats-grid">{metrics.map((metric) => <StatCard key={metric.label} metric={metric} />)}</div>
        <section className="portal-section">
          <div className="portal-section-heading"><div><div className="eyebrow">PARA TI</div><h2>Continúa viendo</h2></div><Link to="/manage-videos" className="text-link">Ver todo →</Link></div>
          {loading && <div className="empty-state">Cargando videos...</div>}
          {error && <div className="empty-state">{error}</div>}
          {!loading && !error && videos.length === 0 && <div className="empty-state">Todavía no hay videos disponibles.</div>}
          <div className="continue-grid">{videos.slice(0, 3).map((video) => <article className="continue-card" key={video.id}><div className={`continue-thumb ${video.thumbnailClass}`}><span className="continue-play">▶</span><span className="duration-tag">{video.duration}</span></div><div className="continue-content"><small>{video.subject}</small><h3>{video.title}</h3><div className="watch-progress"><span style={{ width: `${video.progress ?? 0}%` }} /></div><div className="progress-label"><span>{video.progress ?? 0}% completado</span><span>Minuto {video.currentTime ?? "00:00"}</span></div></div></article>)}</div>
        </section>
        <section className="portal-section subjects-section"><div className="portal-section-heading"><div><div className="eyebrow">MIS MATERIAS</div><h2>Accesos rápidos</h2></div><a href="#subjects" className="text-link">Administrar materias →</a></div><div className="subject-grid">{[["☁", "Desarrollo en la Nube", "24 videos", "subject-purple"], ["◇", "Tecnologías en el Cliente", "18 videos", "subject-orange"], ["▤", "Bases de Datos NoSQL", "16 videos", "subject-blue"], ["✦", "Metodologías Ágiles", "12 videos", "subject-green"]].map(([icon, title, count, tone]) => <a className={`subject-card ${tone}`} href="#subject" key={title}><span className="subject-icon">{icon}</span><div><strong>{title}</strong><small>{count}</small></div><span className="card-arrow">↗</span></a>)}</div></section>
      </div>
    </PortalLayout>
  );
}

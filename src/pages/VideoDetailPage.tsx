import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { PortalLayout, usePortalRole } from "../components/PortalLayout";
import { Toast } from "../components/ui/Toast";
import { videoService } from "../services/videoService";
import type { VideoItem } from "../types";

export function VideoDetailPage() {
  const [role, setRole] = usePortalRole();
  const { id } = useParams();
  const [video, setVideo] = useState<VideoItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    videoService.get(id).then(setVideo).catch((reason) => setError(reason instanceof Error ? reason.message : "No se pudo cargar el detalle.")).finally(() => setLoading(false));
  }, [id]);

  return <PortalLayout role={role} onRoleChange={setRole}><div className="portal-container container detail-page"><Link className="back-link" to="/manage-videos">← Volver al catálogo</Link>{loading && <div className="empty-state">Cargando detalle...</div>}{error && <div className="empty-state">{error}</div>}{!loading && !error && !video && <div className="empty-state">No se encontró el video solicitado.</div>}{video && <section className="detail-card"><div className={`detail-video ${video.thumbnailClass}`}><span>▶</span></div><div className="detail-content"><div className="eyebrow">{video.subject} · {video.code}</div><h1>{video.title}</h1><p>{video.description || "Sin descripción disponible."}</p><div className="detail-meta"><span>Duración: {video.duration}</span><span>Vistas: {video.views}</span><span>Subido: {video.uploadedAt}</span></div><button className="button button-primary" onClick={() => setToast("La reproducción es una demostración visual.")}>Reproducir video</button></div></section>}<Toast message={toast} /></div></PortalLayout>;
}

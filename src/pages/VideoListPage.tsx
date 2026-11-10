import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PortalLayout, usePortalRole } from "../components/PortalLayout";
import { Modal } from "../components/ui/Modal";
import { Toast } from "../components/ui/Toast";
import { VideoForm } from "../components/ui/VideoForm";
import { VideoRow } from "../components/ui/VideoRow";
import { subjects } from "../data/mockVideos";
import { useVideos } from "../hooks/useVideos";
import { videoService } from "../services/videoService";
import { validateVideoForm } from "../utils/videoValidation";
import type { VideoFieldErrors, VideoFormData, VideoItem } from "../types";
import { Can } from "../components/Can";
import { useAuth } from "../context/AuthContext";

const emptyForm: VideoFormData = { title: "", subject: "", code: "", unit: "", description: "", visibility: "campus" };

function formFromVideo(video: VideoItem): VideoFormData {
  return { title: video.title, subject: video.subject, code: video.code, unit: video.unit ?? "", description: video.description ?? "", visibility: video.visibility ?? "campus" };
}

export function VideoListPage() {
  const [role, setRole] = usePortalRole();
  const { videos, setVideos, loading, error, reload } = useVideos();
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("Todas las materias");
  const [toast, setToast] = useState<string | null>(null);
  const [modal, setModal] = useState<"delete" | "edit" | null>(null);
  const [selected, setSelected] = useState<VideoItem | null>(null);
  const [editForm, setEditForm] = useState<VideoFormData>(emptyForm);
  const [editErrors, setEditErrors] = useState<VideoFieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const filtered = useMemo(() => videos.filter((video) => video.title.toLowerCase().includes(search.toLowerCase()) && (subject === "Todas las materias" || video.subject === subject)), [videos, search, subject]);
  const close = () => { setModal(null); setSelected(null); setEditErrors({}); };
  const openEdit = (video: VideoItem) => { setSelected(video); setEditForm(formFromVideo(video)); setModal("edit"); };
  const remove = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await videoService.remove(selected.id);
      setVideos((current) => current.filter((video) => video.id !== selected.id));
      close();
      setToast("Registro eliminado correctamente.");
    } catch (reason) {
      setToast(reason instanceof Error ? reason.message : "No se pudo eliminar el registro.");
    } finally { setSubmitting(false); }
  };
  const saveEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected) return;
    const nextErrors = validateVideoForm(editForm);
    setEditErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setSubmitting(true);
    try {
      const updated = await videoService.update(selected.id, editForm);
      setVideos((current) => current.map((video) => video.id === selected.id ? updated : video));
      close();
      setToast("Cambios guardados correctamente.");
    } catch (reason) {
      setToast(reason instanceof Error ? reason.message : "No se pudieron guardar los cambios.");
    } finally { setSubmitting(false); }
  };
  return <PortalLayout role={role} onRoleChange={setRole}><div className="portal-container container list-page"><div className="page-title-row"><div><div className="eyebrow">CATÁLOGO ACADÉMICO</div><h1>Videos publicados</h1><p>Consulta los materiales disponibles en la plataforma.</p></div><Can role="docente"><Link className="button button-primary" to="/upload-video">＋ Nuevo Video</Link></Can></div><div className="list-toolbar"><div className="list-search"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por título..." /></div><select value={subject} onChange={(e) => setSubject(e.target.value)}><option>Todas las materias</option>{subjects.map((item) => <option key={item}>{item}</option>)}</select><span className="result-count">{loading ? "Cargando..." : `${filtered.length} registros`}</span></div><section className="video-table"><div className="table-head"><span>Material audiovisual</span><span>Duración</span><span>Fecha de subida</span><span>Vistas</span><span>Acciones</span></div>{loading && <div className="empty-state">Cargando videos...</div>}{error && <div className="empty-state"><p>{error}</p><button className="button button-secondary" onClick={() => void reload()}>Reintentar</button></div>}{!loading && !error && filtered.map((video) => <VideoRow key={video.id} video={video} onPreview={(item) => navigate(`/videos/${item.id}`)} onEdit={openEdit}   onDelete={(item) => { setSelected(item); setModal("delete"); }} canManage={user?.role === "docente"} />)}{!loading && !error && filtered.length === 0 && <div className="empty-state">No encontramos videos con esos filtros.</div>}</section><Toast message={toast} type={toast?.includes("correctamente") ? "success" : "error"} /><Link className="back-link list-back" to="/dashboard">← Regresar al dashboard</Link></div>{modal === "delete" && selected && <Modal title="¿Deseas eliminar este registro?" description={`Se eliminará “${selected.title}”. Esta operación sí se enviará a la API.`} onClose={close}><div className="modal-actions"><button className="button button-secondary" onClick={close}>No, conservar</button><button className="button button-danger" disabled={submitting} onClick={() => void remove()}>{submitting ? "Eliminando..." : "Sí, eliminar"}</button></div></Modal>}{modal === "edit" && selected && <Modal title="Editar material" description="Actualiza los datos y guarda los cambios en la API." onClose={close}><VideoForm data={editForm} errors={editErrors} submitting={submitting} submitLabel="Guardar cambios" onChange={(field, value) => setEditForm((current) => ({ ...current, [field]: value }))} onSubmit={saveEdit} onCancel={close} /></Modal>}</PortalLayout>;
}

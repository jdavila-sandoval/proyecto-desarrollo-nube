import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PortalLayout, usePortalRole } from "../components/PortalLayout";
import { VideoForm } from "../components/ui/VideoForm";
import { Toast } from "../components/ui/Toast";
import { videoService } from "../services/videoService";
import { validateVideoForm } from "../utils/videoValidation";
import type { VideoFieldErrors, VideoFormData } from "../types";

const initialForm: VideoFormData = {
  title: "",
  subject: "",
  code: "",
  unit: "",
  description: "",
  visibility: "campus",
};

export function UploadVideoPage() {
  const [role, setRole] = usePortalRole();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<VideoFieldErrors>({});
  const [toast, setToast] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const update = (field: keyof VideoFormData, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validateVideoForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await videoService.create(form);
      setToast("El video se creó correctamente.");
      window.setTimeout(() => navigate("/manage-videos"), 800);
    } catch (reason) {
      setToast(reason instanceof Error ? reason.message : "No se pudo crear el video.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PortalLayout role={role} onRoleChange={setRole}>
      <div className="portal-container container upload-page">
        <div className="page-title-row">
          <div>
            <Link className="back-link" to="/dashboard">← Volver al dashboard</Link>
            <h1>Publicar nuevo material audiovisual</h1>
            <p>Comparte una clase, tutorial o recurso con tu comunidad académica.</p>
          </div>
        </div>
        <div className="upload-layout">
          <section className="upload-form-card">
            <div className="upload-dropzone">
              <div className="upload-icon">↑</div>
              <strong>Arrastra tu video aquí o <u>examina tus archivos</u></strong>
              <span>Formatos aceptados: .mp4, .webm · Máximo 2 GB</span>
              <div className="file-progress">
                <div><span>Archivo cargado: clase_semana_04.mp4</span><small>45.2 MB · 100%</small></div>
                <span className="file-bar"><i /></span>
              </div>
            </div>
            <div className="form-section-title">Información del material</div>
            <VideoForm data={form} errors={errors} submitting={submitting} submitLabel="Publicar video →" onChange={update} onSubmit={submit} onCancel={() => navigate("/dashboard")} />
            <button className="draft-button" type="button" onClick={() => setToast("Borrador guardado correctamente.")}>Guardar borrador</button>
          </section>
          <aside className="upload-aside">
            <div className="aside-card"><span className="aside-badge">TIP</span><h3>Haz que tu material destaque</h3><p>Un título claro, una descripción breve y referencias ayudan a tus alumnos a encontrar y aprovechar mejor tu contenido.</p></div>
            <div className="aside-card checklist"><h3>Checklist de publicación</h3><span>✓ Video en formato compatible</span><span>○ Título descriptivo</span><span>○ Materia y unidad asignadas</span><span>○ Referencias académicas</span></div>
          </aside>
        </div>
        <Toast message={toast} type={toast?.includes("correctamente") ? "success" : "error"} />
      </div>
    </PortalLayout>
  );
}

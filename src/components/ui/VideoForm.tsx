import type { ChangeEvent, FormEvent } from "react";
import type { VideoFieldErrors, VideoFormData } from "../../types";
import { subjects } from "../../data/mockVideos";

interface VideoFormProps {
  data: VideoFormData;
  errors: VideoFieldErrors;
  submitting: boolean;
  submitLabel: string;
  onChange: (field: keyof VideoFormData, value: string) => void;
  onSubmit: (event: FormEvent) => void;
  onCancel?: () => void;
}

export function VideoForm({
  data,
  errors,
  submitting,
  submitLabel,
  onChange,
  onSubmit,
  onCancel,
}: VideoFormProps) {
  const update =
    (field: keyof VideoFormData) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      onChange(field, event.target.value);
  return (
    <form onSubmit={onSubmit} noValidate>
      <label className="portal-field">
        <span>Título de la clase / video</span>
        <input value={data.title} onChange={update("title")} placeholder="Ej. Introducción a los contenedores" />
        {errors.title && <small className="field-error">{errors.title}</small>}
      </label>
      <div className="portal-form-row">
        <label className="portal-field">
          <span>Asignatura / Materia</span>
          <select value={data.subject} onChange={update("subject")}>
            <option value="">Selecciona una materia</option>
            {subjects.map((subject) => <option key={subject}>{subject}</option>)}
          </select>
          {errors.subject && <small className="field-error">{errors.subject}</small>}
        </label>
        <label className="portal-field">
          <span>Código de materia</span>
          <input value={data.code} onChange={update("code")} placeholder="Ej. NUB-204" />
          {errors.code && <small className="field-error">{errors.code}</small>}
        </label>
      </div>
      <label className="portal-field">
        <span>Unidad / Módulo temático</span>
        <input value={data.unit} onChange={update("unit")} placeholder="Ej. Unidad 4: Despliegue" />
        {errors.unit && <small className="field-error">{errors.unit}</small>}
      </label>
      <label className="portal-field">
        <span>Descripción y referencias académicas</span>
        <textarea value={data.description} onChange={update("description")} rows={4} placeholder="Describe los temas abordados y agrega referencias..." />
        {errors.description && <small className="field-error">{errors.description}</small>}
      </label>
      <div className="portal-field">
        <span>Visibilidad</span>
        <label className="radio-option"><input type="radio" name="visibility" checked={data.visibility === "campus"} onChange={() => onChange("visibility", "campus")} /> Público para el campus</label>
        <label className="radio-option"><input type="radio" name="visibility" checked={data.visibility === "group"} onChange={() => onChange("visibility", "group")} /> Privado para el grupo</label>
      </div>
      <div className="upload-actions">
        {onCancel && <button className="button button-secondary" type="button" onClick={onCancel}>Cancelar</button>}
        <button className="button button-primary" type="submit" disabled={submitting}>{submitting ? "Procesando..." : submitLabel}</button>
      </div>
    </form>
  );
}

import type { VideoFieldErrors, VideoFormData } from "../types";

export function validateVideoForm(data: VideoFormData): VideoFieldErrors {
  const errors: VideoFieldErrors = {};
  if (!data.title.trim()) errors.title = "El título es obligatorio.";
  else if (data.title.trim().length < 5) {
    errors.title = "El título debe tener al menos 5 caracteres.";
  }
  if (!data.subject) errors.subject = "Selecciona una materia.";
  if (!data.code.trim()) errors.code = "El código de materia es obligatorio.";
  if (!data.unit.trim()) errors.unit = "La unidad o módulo es obligatorio.";
  if (!data.description.trim()) {
    errors.description = "Agrega una descripción breve.";
  }
  return errors;
}

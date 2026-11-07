import type { NextFunction, Request, Response } from 'express';

export interface ErrorDetail {
  field: string;
  message: string;
}


export class AppError extends Error {
  status: number;
  details?: ErrorDetail[];

  constructor(status: number, message: string, details?: ErrorDetail[]) {
    super(message);
    this.status = status;
    this.details = details;
  }

  // body referencia a un recurso que no existe
  static invalidReference(field: string, message: string) {
    return new AppError(400, "Datos inválidos", [{ field, message }]);
  }
}

// Rutas que no existen 
export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  next(new AppError(404, "La ruta solicitada no existe"));
}

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  let status = 500;
  let message = "Error interno del servidor";
  let details: ErrorDetail[] | undefined;

  if (err instanceof AppError) {
    ({ status, message, details } = err);
  } else if (err?.code === 11000) {
    // Duplicado en un índice único de MongoDB
    const fields = Object.keys(err.keyPattern ?? err.keyValue ?? {});
    status = 409;
    message = "Ya existe un registro con esos datos";
    details = fields.map((field) => ({ field, message: "Valor duplicado" }));
  } else if (err?.name === "CastError") {
    // Id o valor con formato inválido
    status = 400;
    message = "Datos inválidos";
    details = [{ field: String(err.path ?? "id"), message: "Formato inválido" }];
  } else if (err?.name === "ValidationError" && err.errors) {
    // Falla en las validaciones del esquema de Mongoose
    status = 400;
    message = "Datos inválidos";
    details = Object.keys(err.errors).map((field) => ({ field, message: String(err.errors[field].message) }));
  } else if (err?.type === "entity.parse.failed") {
    // JSON mal formado en el body
    status = 400;
    message = "El cuerpo de la petición no es un JSON válido";
  } else if (err?.type === "entity.too.large") {
    status = 413;
    message = "El cuerpo de la petición es demasiado grande";
  }

  if (status >= 500) console.error("Error no controlado:", err);

  if (!req.originalUrl.startsWith("/api") && req.accepts(["json", "html"]) === "html") {
    res.status(status).render("error", { title: `Error ${status}`, status, message });
    return;
  }

  res.status(status).json({ error: { message, ...(details?.length ? { details } : {}) } });
}

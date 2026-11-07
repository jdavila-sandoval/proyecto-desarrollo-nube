import type { NextFunction, Request, Response } from "express";
import { z } from "zod";
import type { ZodType } from "zod";
import { AppError } from "./error.middleware";
import type { ErrorDetail } from "./error.middleware";

// mensajes por default de zod
z.config({ customError: (issue) => {
  switch (issue.code) {
    case "invalid_type":
      return { message: issue.input === undefined ? "Es obligatorio" : "Tipo de dato inválido" };
    case "invalid_value":
      return { message: `Valor no permitido. Valores válidos: ${issue.values.join(", ")}` };
    case "unrecognized_keys":
      return { message: "Campo no permitido" };
    default:
      return undefined;
  }
} });

interface Schemas {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
}

// Valida params, query y body con zod ANTES de llegar al controlador
// Si algo falla responde 400 indicando que campo falló y por que
export const validate = (schemas: Schemas) => (req: Request, res: Response, next: NextFunction) => {
  const details: ErrorDetail[] = [];

  for (const source of ["params", "query", "body"] as const) {
    const schema = schemas[source];
    if (!schema) continue;

    const result = schema.safeParse(req[source] ?? {});
    if (result.success) {
      if (source === "body") req.body = result.data;
      if (source === "query") res.locals.query = result.data;
      continue;
    }

    for (const issue of result.error.issues) {
      const path = issue.code === "unrecognized_keys" ? [...issue.path, ...issue.keys] : issue.path;
      details.push({ field: path.join(".") || source, message: issue.message });
    }
  }

  next(details.length > 0 ? new AppError(400, "Datos inválidos", details) : undefined);
};

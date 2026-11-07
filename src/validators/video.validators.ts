import { z } from "zod";

import { objectId } from "./common";

//GET /videos, en este el formulario envia los campos vacios cuando no se filtra por categoria
// "" se tratan como sin filtro
const vacioComoUndefined = (valor: unknown) => (valor === "" ? undefined : valor);

export const viewVideosQuery = z.object({
    search: z.preprocess(vacioComoUndefined, z.string().trim().max(100, "Máximo 100 caracteres").optional()),
    category: z.preprocess(vacioComoUndefined, objectId.optional()),
  }).strict();

const videoFields = {
  title: z.string().trim().min(1).max(150),
  description: z.string().trim().max(2000).optional(),
  videoUrl: z.string().url().refine((value) => /^https?:$/.test(new URL(value).protocol), "Debe ser una URL http o https"),
  thumbnailUrl: z.string().url().refine((value) => /^https?:$/.test(new URL(value).protocol), "Debe ser una URL http o https").optional(),
  categoryId: objectId,
};

export const createVideoBody = z.object(videoFields).strict();
export const putVideoBody = z.object(videoFields).strict();
export const patchVideoBody = z.object(videoFields).partial().strict().refine((value) => Object.keys(value).length > 0, "Debe enviar al menos un campo para actualizar");

export const listVideosQuery = z.object({
  search: z.string().trim().max(100).optional(),
  category: objectId.optional(),
  author: objectId.optional(),
  sort: z.enum(["date", "views"]).default("date"),
  order: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).strict();
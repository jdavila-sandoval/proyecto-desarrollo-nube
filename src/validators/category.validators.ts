import { z } from "zod";

const fields = {
  name: z.string().trim().min(1).max(50),
  description: z.string().trim().max(300).optional(),
};

export const createCategoryBody = z.object(fields).strict();
export const putCategoryBody = z.object(fields).strict();
export const patchCategoryBody = z.object(fields).partial().strict().refine((value) => Object.keys(value).length > 0, "Debe enviar al menos un campo para actualizar");
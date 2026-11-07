import { z } from "zod";
import { objectId, alMenosUnCampo, MENSAJE_ALMENOS_UNO } from "./common";

const textoComentario = z
  .string()
  .trim()
  .min(1, "El comentario no puede estar vacío")
  .max(1000, "El comentario no puede exceder los 1000 caracteres");

//PoSt /api/comments - El autor no se recibe del cliente, es el usuario con sesion (req.user)
export const createCommentBody = z
  .object({
    video: objectId,
    content: textoComentario,
  })
  .strict();

// PUT /api/comments/:id - En un comentario solo se permite actualizar el contenido
export const putCommentBody = z
  .object({
    content: textoComentario,
  })
  .strict();

// PATCH /api/comments/:id - Modificación parcial del contenido
export const patchCommentBody = z
  .object({
    content: textoComentario,
  })
  .strict()
  .refine(alMenosUnCampo, MENSAJE_ALMENOS_UNO);

// GET /api/comments?video=&author=
export const listCommentsQuery = z
  .object({
    video: objectId.optional(),
    author: objectId.optional(),
  })
  .strict();

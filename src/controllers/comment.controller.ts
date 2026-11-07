import type { Request, Response } from "express";
import { CommentModel } from "../models/Comment.model";
import { VideoModel } from "../models/Video.model";
import { AppError } from "../middleware/error.middleware";

// GET /api/comments?video=&author=
// Permite listar todos los comentarios o filtrarlos por video o por autor
export const getAllComments = async (_req: Request, res: Response) => {
  const query = res.locals.query ?? {};
  const filter: Record<string, any> = {};

  if (query.video) {
    filter.video = query.video;
  }
  if (query.author) {
    filter["author.userId"] = query.author;
  }

  const comments = await CommentModel.find(filter).sort({ createdAt: -1 });
  res.status(200).json(comments);
};

// GET /api/comments/:id
export const getCommentById = async (req: Request, res: Response) => {
  const comment = await CommentModel.findById(req.params.id);
  if (!comment) {
    throw new AppError(404, "Comentario no encontrado");
  }

  res.status(200).json(comment);
};

// POST /api/comments
// Valida la existencia de las entidades foráneas y guarda el snapshot del autor
export const createComment = async (req: Request, res: Response) => {
  const { video, content } = req.body;

  const videoExiste = await VideoModel.exists({ _id: video });
  if (!videoExiste) {
    throw AppError.invalidReference("video", "El video especificado no existe");
  }

  const author = req.user!;

  const comment = await CommentModel.create({
    video,
    content,
    author: {
      userId: author._id,
      username: author.username,
    },
  });

  res.status(201).json(comment);
};

// PUT /api/comments/:id
// Reemplazo completo de los campos editables del comentario (solo contenido)
export const updateComment = async (req: Request, res: Response) => {
  const comment = await CommentModel.findByIdAndUpdate(
    req.params.id,
    { content: req.body.content },
    { returnDocument: "after", runValidators: true }
  );

  if (!comment) {
    throw new AppError(404, "Comentario no encontrado");
  }

  res.status(200).json(comment);
};

// PATCH /api/comments/:id
// Actualización parcial del comentario
export const patchComment = async (req: Request, res: Response) => {
  const comment = await CommentModel.findByIdAndUpdate(
    req.params.id,
    { content: req.body.content },
    { returnDocument: "after", runValidators: true }
  );

  if (!comment) {
    throw new AppError(404, "Comentario no encontrado");
  }

  res.status(200).json(comment);
};

// DELETE /api/comments/:id
// Borrado físico directo del comentario
export const deleteComment = async (req: Request, res: Response) => {
  const comment = await CommentModel.findByIdAndDelete(req.params.id);
  if (!comment) {
    throw new AppError(404, "Comentario no encontrado");
  }

  res.status(200).json({ message: "Comentario eliminado correctamente" });
};

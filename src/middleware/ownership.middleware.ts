import type { Request, Response, NextFunction } from "express";
import { AppError } from "./error.middleware.js";
import { VideoModel } from "../models/Video.model.js";
import { CommentModel } from "../models/Comment.model.js";
import { ReactionModel } from "../models/Reaction.model.js";

/**
 * Quita del body los campos que decide el servidor por ejemplo, el dueño del recurso, Si el cliente es el que los manda se ignoran, el dueño siempre sale de req.user, nunca del body
 * Va ANTES de validate() para que el esquema estricto no rechace la petición por ese campo
 */
export function ignoreBodyFields(...fields: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (req.body && typeof req.body === "object") {
      for (const field of fields) delete req.body[field];
    }
    next();
  };
}

/**
 * Propiedad para rutas /users/:id, donde el "dueño" del recurso es el propio usuario
 * Solo pasa quien tiene ese id; con allowAdmin también pasa un admin
 * Si no cumple responde 403: como los perfiles son públicos ocultar su existencia (404) no aporta nada
 * Se compara contra el id de la URL sin consultar a la base de datos, por lo que tampoco revela si el id existe
 */
export function requireSelf(options: { allowAdmin?: boolean } = {}) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError(401, "No autenticado"));
    }

    const isSelf = String(req.user._id) === String(req.params.id);
    const isAdmin = req.user.role === "admin";

    if (isSelf || (options.allowAdmin && isAdmin)) {
      return next();
    }
    return next(new AppError(403, "No tienes permiso para modificar los datos de otro usuario"));
  };
}

interface OwnershipOptions<T> {
  // Carga el recurso de la ruta (/:id). Devuelve null si no existe
  load: (id: string) => Promise<T | null>;
  // Id del dueño del recurso, aquel que lo creó
  ownerId: (resource: T) => unknown;
  notFoundMessage: string;
  deniedMessage: string;
  // Si es true, un admin también puede actuar sobre los recursos de terceros
  allowAdmin?: boolean;
  // Si es true, un recurso ajeno responde 404, no revela que existe
  hideExistence?: boolean;
}

/**
 * Middleware de propiedad que deja pasar al dueño del recurso o a un admin si allowAdmin es true
 * Va después de requireAuth. Evita repetir la verificación en cada controlador
 */
export function requireOwnership<T>(options: OwnershipOptions<T>) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return next(new AppError(401, "No autenticado"));
      }

      const resource = await options.load(String(req.params.id));
      if (!resource) {
        return next(new AppError(404, options.notFoundMessage));
      }

      const isOwner = String(options.ownerId(resource)) === String(req.user._id);
      const isAdmin = options.allowAdmin === true && req.user.role === "admin";
      if (isOwner || isAdmin) {
        return next();
      }

      if (options.hideExistence) {
        return next(new AppError(404, options.notFoundMessage));
      }
      return next(new AppError(403, options.deniedMessage));
    } catch (error) {
      return next(error);
    }
  };
}

// Videos y comentarios son contenido público, un recurso ajeno responde 403, su existencia no es secreta
export const videoOwnerOrAdmin = requireOwnership({
  load: async (id) => VideoModel.findById(id).exec(),
  ownerId: (video) => video.author.userId,
  allowAdmin: true,
  notFoundMessage: "Video no encontrado",
  deniedMessage: "Solo el autor del video o un administrador pueden modificarlo",
});

// Editar un comentario, solo el autor, tambien para el admin
export const commentOwner = requireOwnership({
  load: async (id) => CommentModel.findById(id).exec(),
  ownerId: (comment) => comment.author.userId,
  notFoundMessage: "Comentario no encontrado",
  deniedMessage: "Solo el autor puede editar su comentario",
});

// Eliminar un comentario, el autor o un admin
export const commentOwnerOrAdmin = requireOwnership({
  load: async (id) => CommentModel.findById(id).exec(),
  ownerId: (comment) => comment.author.userId,
  allowAdmin: true,
  notFoundMessage: "Comentario no encontrado",
  deniedMessage: "Solo el autor del comentario o un administrador pueden eliminarlo",
});

// Las reacciones son datos personales, una reacción ajena responde 404 para no revelar que existe
// Consultar una reacción solo para su dueño o un admin
export const reactionOwnerOrAdmin = requireOwnership({
  load: async (id) => ReactionModel.findById(id).exec(),
  ownerId: (reaction) => reaction.user,
  allowAdmin: true,
  hideExistence: true,
  notFoundMessage: "Reacción no encontrada",
  deniedMessage: "No tienes permiso sobre esta reacción",
});

// Quitar un "me gusta", solo su dueño, tambien para el admin
export const reactionOwner = requireOwnership({
  load: async (id) => ReactionModel.findById(id).exec(),
  ownerId: (reaction) => reaction.user,
  hideExistence: true,
  notFoundMessage: "Reacción no encontrada",
  deniedMessage: "No tienes permiso sobre esta reacción",
});

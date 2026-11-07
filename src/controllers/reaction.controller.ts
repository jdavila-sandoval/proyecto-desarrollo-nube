import type { Request, Response } from "express";
import { ReactionModel } from "../models/Reaction.model";
import { VideoModel } from "../models/Video.model";
import { AppError } from "../middleware/error.middleware";

//Lista privada, los usuarios solo pueden ver sus propias reacciones, el admin puede verlas todas
export const getAllReactions = async (req: Request, res: Response) => {
  const query = res.locals.query ?? {};
  const me = req.user!;
  const filter: Record<string, unknown> = {};
  if (query.video) filter.video = query.video;

  if (me.role === "admin") {
    if (query.user) filter.user = query.user;
  } else {
    if (query.user && String(query.user) !== String(me._id)) {
      throw new AppError(403, "Solo puedes consultar tus propias reacciones");
    }
    filter.user = me._id;
  }
  res.status(200).json(await ReactionModel.find(filter).sort({ createdAt: -1 }));
};
export const createReaction = async (req: Request, res: Response) => {
  const { video, type } = req.body;
  if (!await VideoModel.exists({ _id: video })) throw AppError.invalidReference("video", "El video especificado no existe");

  // El dueño de la reacción es el usuario con sesión, nunca viene del body
  const reaction = await ReactionModel.create({ video, user: req.user!._id, type });
  await VideoModel.updateOne({ _id: video }, { $inc: { likesCount: 1 } }, { timestamps: false });
  res.status(201).json(reaction);
};

export const getReactionById = async (req: Request, res: Response) => {
  const reaction = await ReactionModel.findById(req.params.id);
  if (!reaction) throw new AppError(404, "Reacción no encontrada");
  res.status(200).json(reaction);
};

export const updateReaction = async (_req: Request, _res: Response) => {
  throw new AppError(405, "Las reacciones no se pueden editar; elimínela y cree otra");
};

export const patchReaction = async (_req: Request, _res: Response) => {
  throw new AppError(405, "Las reacciones no se pueden editar; elimínela y cree otra");
};

export const deleteReaction = async (req: Request, res: Response) => {
  const reaction = await ReactionModel.findByIdAndDelete(req.params.id);
  if (!reaction) throw new AppError(404, "Reacción no encontrada");
  await VideoModel.updateOne({ _id: reaction.video, likesCount: { $gt: 0 } }, { $inc: { likesCount: -1 } }, { timestamps: false });
  res.status(200).json({ message: "Reacción eliminada correctamente" });
};
import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { UserModel } from "../models/User.model";
import { CategoryModel } from "../models/Category.model";
import { VideoModel } from "../models/Video.model";
import { CommentModel } from "../models/Comment.model";
import { ReactionModel } from "../models/Reaction.model";
import { AppError } from "../middleware/error.middleware";
import { clearSessionCookie } from "../config/session.js";

const SALT_ROUNDS = 10;

export const getAllUsers = async (_req: Request, res: Response) => {
  const { role } = res.locals.query;
  const users = await UserModel.find(role ? { role } : {}).sort({ createdAt: -1 });
  res.json(users);
};

export const createUser = async (req: Request, res: Response) => {
  const { password, ...data } = req.body;
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Si username o email ya existen, el índice único falla (11000) y el middleware responde 409
  const user = await UserModel.create({ ...data, passwordHash });
  res.status(201).json(user);
};

export const getUserById = async (req: Request, res: Response) => {
  const user = await UserModel.findById(req.params.id).select("-email");
  if (!user) throw new AppError(404, "Usuario no encontrado");
  res.json(user);
};

export const getUserVideos = async (req: Request, res: Response) => {
  const user = await UserModel.findById(req.params.id);
  if (!user) throw new AppError(404, "Usuario no encontrado");

  const videos = await VideoModel.find({ "author.userId": user._id }).sort({ publishedAt: -1 });
  res.json(videos);
};

// PUT y PATCH. PUT exige username y email, PATCH solo los campos enviados
export const updateUser = async (req: Request, res: Response) => {
  const { password, ...changes } = req.body;
  if (password) changes.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await UserModel.findByIdAndUpdate(req.params.id, changes, { returnDocument: "after", runValidators: true });
  if (!user) throw new AppError(404, "Usuario no encontrado");

  // Si cambió el username se actualizan las copias (snapshots) embebidas en videos y comentarios
  if (changes.username) {
    await VideoModel.updateMany({ "author.userId": user._id }, { "author.username": user.username });
    await CommentModel.updateMany({ "author.userId": user._id }, { "author.username": user.username });
  }
  res.json(user);
};

// PATCH /users/:id/role solo para admin. Es la unica via para cambiar el rol de un usuario
export const changeUserRole = async (req: Request, res: Response) => {
  if (String(req.user!._id) === String(req.params.id)) {
    throw new AppError(400, "No puedes cambiar tu propio rol");
  }

  const user = await UserModel.findByIdAndUpdate(req.params.id, { role: req.body.role }, { returnDocument: "after", runValidators: true });
  if (!user) throw new AppError(404, "Usuario no encontrado");
  res.json(user);
};

export const deleteUser = async (req: Request, res: Response) => {
  const user = await UserModel.findById(req.params.id);
  if (!user) throw new AppError(404, "Usuario no encontrado");
  
  const categories = await CategoryModel.countDocuments({ createdBy: user._id });
  if (categories > 0) {
    throw new AppError(409, `No se puede eliminar el usuario: creó ${categories} categoría(s). Elimina esas categorías primero`);
  }

  const videoIds = await VideoModel.find({ "author.userId": user._id }).distinct("_id");
  const likedVideoIds = await ReactionModel.find({ user: user._id }).distinct("video");

  await VideoModel.updateMany(
    { _id: { $in: likedVideoIds }, likesCount: { $gt: 0 } },
    { $inc: { likesCount: -1 } },
    { timestamps: false }
  );
  await CommentModel.deleteMany({ $or: [{ video: { $in: videoIds } }, { "author.userId": user._id }] });
  await ReactionModel.deleteMany({ $or: [{ video: { $in: videoIds } }, { user: user._id }] });
  await VideoModel.deleteMany({ _id: { $in: videoIds } });
  await user.deleteOne();

  // Si el usuario borro su cuenta, se cierra su sesion
  if (String(req.user?._id) === String(user._id)) clearSessionCookie(res)

  res.json({ message: "Usuario eliminado" });
};

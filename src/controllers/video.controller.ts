import type { Request, Response } from "express";
import { VideoModel } from "../models/Video.model";
import { CategoryModel } from "../models/Category.model";
import { CommentModel } from "../models/Comment.model";
import { ReactionModel } from "../models/Reaction.model";
import { AppError } from "../middleware/error.middleware";

export function videoFilter(query: { search?: string; category?: string; author?: string }) {
  const filter: Record<string, any> = {};
  if (query.search) {
    // Se escapan los caracteres especiales para que el texto se busque tal cual se escribio
    filter.title = { $regex: query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
  }
  if (query.category) filter["category.categoryId"] = query.category;
  if (query.author) filter["author.userId"] = query.author;
  return filter;
}

export const getAllVideos = async ( _req: Request, res: Response) => {
  const query = res.locals.query ?? {};
  const filter = videoFilter(query);
  const sortField = query.sort === "views" ? "views" : "publishedAt";
  const sortDirection = query.order === "asc" ? 1 : -1;
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const [videos, total] = await Promise.all([
    VideoModel.find(filter).sort({ [sortField]: sortDirection }).skip((page - 1) * limit).limit(limit),
    VideoModel.countDocuments(filter),
  ]);
  res.status(200).json({ data: videos, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
};

export const createVideo = async (req: Request, res: Response) => {
  const { categoryId, ...data } = req.body;
  const category = await CategoryModel.findById(categoryId);
  if (!category) throw AppError.invalidReference("categoryId", "La categoría especificada no existe");

  // El autor es el usuario con sesion nunca viene del body
  const author = req.user!;
  const video = await VideoModel.create({
    ...data,
    author: { userId: author._id, username: author.username },
    category: { categoryId: category._id, name: category.name },
  });
  res.status(201).json(video);
};

export const getVideoById = async (req: Request, res: Response) => {
  const video = await VideoModel.findById(req.params.id);
  if (!video) throw new AppError(404, "Video no encontrado");
  await VideoModel.updateOne({ _id: video._id }, { $inc: { views: 1 } }, { timestamps: false });
  video.views += 1;
  res.status(200).json(video);
};

export const updateVideo = async (req: Request, res: Response) => {
  const video = await updateVideoData(String(req.params.id), req.body);
  res.status(200).json(video);
};

export const patchVideo = async (req: Request, res: Response) => {
  const video = await updateVideoData(String(req.params.id), req.body);
  res.status(200).json(video);
};

export const deleteVideo = async (req: Request, res: Response) => {
  const video = await VideoModel.findByIdAndDelete(req.params.id);
  if (!video) throw new AppError(404, "Video no encontrado");
  await Promise.all([
    CommentModel.deleteMany({ video: video._id }),
    ReactionModel.deleteMany({ video: video._id }),
  ]);
  res.status(200).json({ message: "Video eliminado correctamente" });
};

async function updateVideoData(id: string, input: Record<string, any>) {
  const changes: Record<string, any> = { ...input };
  if (input.categoryId) {
    const category = await CategoryModel.findById(input.categoryId);
    if (!category) throw AppError.invalidReference("categoryId", "La categoría especificada no existe");
    changes.category = { categoryId: category._id, name: category.name };
  }
  delete changes.categoryId;
  const video = await VideoModel.findByIdAndUpdate(id, changes, { returnDocument: "after", runValidators: true });
  if (!video) throw new AppError(404, "Video no encontrado");
  return video;
}

import type { Request, Response } from "express";
import { VideoModel } from "../models/Video.model";
import { CategoryModel } from "../models/Category.model";
import { CommentModel } from "../models/Comment.model";
import { AppError } from "../middleware/error.middleware";
import { videoFilter } from "./video.controller";


// GET / 
export const home = async (_req: Request, res: Response) => {
  const videos = await VideoModel.find().sort({ publishedAt: -1 }).limit(6).lean();
  const categorias = await CategoryModel.find().sort({ name: 1 }).lean();
  res.render("home", { title: "VideoHub", videos, categorias });
};

// GET /videos?search=&category= 
export const listVideos = async (_req: Request, res: Response) => {
  const { search = "", category } = res.locals.query;

  const videos = await VideoModel.find(videoFilter(res.locals.query)).sort({ publishedAt: -1 }).lean();
  const categorias = await CategoryModel.find().sort({ name: 1 }).lean();

  res.render("videos/list", { title: "Videos", videos, categorias, search, category, total: videos.length });
};

// GET /videos/:id 
export const videoDetail = async (req: Request, res: Response) => {
  const video = await VideoModel.findById(req.params.id).lean();
  if (!video) throw new AppError(404, "Video no encontrado");

  const comentarios = await CommentModel.find({ video: video._id }).sort({ createdAt: -1 }).lean();
  res.render("videos/detail", { title: video.title, video, comentarios });
};

import type { Request, Response } from "express";
import { AppError } from "../middleware/error.middleware.js";
import {
  createCloudVideo,
  getCloudVideo,
  listCloudVideos,
} from "../cloud/cloud-video.repository.js";

export async function listCloudVideoController(req: Request, res: Response) {
  const query = res.locals.query ?? {};
  const category = typeof query.category === "string" ? query.category : undefined;
  const videos = await listCloudVideos(category);
  res.status(200).json({ data: videos, total: videos.length });
}

export async function createCloudVideoController(req: Request, res: Response) {
  const video = await createCloudVideo(req.body);
  res.status(201).json(video);
}

export async function getCloudVideoController(req: Request, res: Response) {
  const videoId = typeof req.params.id === "string" ? req.params.id : req.params.id[0];
  const video = await getCloudVideo(videoId);
  if (!video) throw new AppError(404, "Video no encontrado");
  res.status(200).json(video);
}

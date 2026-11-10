import type { VideoFormData, VideoItem } from "../types";
import { apiRequest } from "./apiClient";

export const videoService = {
  list: () => apiRequest<VideoItem[]>("/videos"),
  get: (id: string) => apiRequest<VideoItem>(`/videos/${encodeURIComponent(id)}`),
  create: (data: VideoFormData) =>
    apiRequest<VideoItem>("/videos", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        duration: "00:00",
        uploadedAt: new Date().toLocaleDateString("es-MX", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        views: 0,
        thumbnailClass: "thumb-blue",
      }),
    }),
  update: (id: string | number, data: VideoFormData) =>
    apiRequest<VideoItem>(`/videos/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  remove: (id: string | number) =>
    apiRequest<void>(`/videos/${encodeURIComponent(id)}`, { method: "DELETE" }),
};

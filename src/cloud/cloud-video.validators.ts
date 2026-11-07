import { z } from "zod";

export const cloudVideoIdParams = z.object({
  id: z.string().uuid("Debe ser un UUID válido"),
});

export const listCloudVideosQuery = z.object({
  category: z.string().trim().min(1).optional(),
});

export const createCloudVideoBody = z
  .object({
    title: z.string().trim().min(1).max(150),
    description: z.string().trim().max(2000).optional(),
    category: z.string().trim().min(1).max(80),
    videoUrl: z.string().url(),
    thumbnailUrl: z.string().url().optional(),
  })
  .strict();

import { z } from "zod";
import { objectId } from "./common";

export const createReactionBody = z.object({
  video: objectId,
  type: z.literal("like").default("like"),
}).strict();

export const listReactionsQuery = z.object({
  video: objectId.optional(),
  user: objectId.optional(),
}).strict();
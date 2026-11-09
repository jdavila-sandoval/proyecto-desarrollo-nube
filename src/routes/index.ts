import { Router } from "express";

import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import videoRoutes from "./video.routes";
import commentRoutes from "./comment.routes";
import reactionRoutes from "./reaction.routes";
import categoryRoutes from "./category.routes";
import cloudVideoRoutes from "./cloud-video.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/videos", cloudVideoRoutes);
router.use("/videos", videoRoutes);
router.use("/comments", commentRoutes);
router.use("/reactions", reactionRoutes);
router.use("/categories", categoryRoutes);
router.use("/cloud/videos", cloudVideoRoutes);

export default router;
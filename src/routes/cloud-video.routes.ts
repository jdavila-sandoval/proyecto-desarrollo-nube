import { Router } from "express";
import {
  createCloudVideoController,
  getCloudVideoController,
  listCloudVideoController,
} from "../controllers/cloud-video.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  cloudVideoIdParams,
  createCloudVideoBody,
  listCloudVideosQuery,
} from "../cloud/cloud-video.validators.js";

const router = Router();

router
  .route("/")
  .get(validate({ query: listCloudVideosQuery }), listCloudVideoController)
  .post(validate({ body: createCloudVideoBody }), createCloudVideoController);

router.get("/:id", validate({ params: cloudVideoIdParams }), getCloudVideoController);

export default router;

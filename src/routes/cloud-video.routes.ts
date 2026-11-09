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

router.use((_req, _res, next) => {
  if (process.env.CLOUD_MODE !== "true") {
    return next("router");
  }
  next();
});

router
  .route("/")
  .get(validate({ query: listCloudVideosQuery }), listCloudVideoController)
  .post(validate({ body: createCloudVideoBody }), createCloudVideoController);

router.get("/:id", validate({ params: cloudVideoIdParams }), getCloudVideoController);

export default router;

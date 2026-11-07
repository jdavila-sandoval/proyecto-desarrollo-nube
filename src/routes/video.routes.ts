import { Router } from "express";
import {
  getAllVideos,
  createVideo,
  getVideoById,
  updateVideo,
  patchVideo,
  deleteVideo,
} from "../controllers/video.controller";
import { validate } from "../middleware/validate.middleware";
import { requireAuth } from "../middleware/auth.middleware.js";
import { ignoreBodyFields, videoOwnerOrAdmin } from "../middleware/ownership.middleware.js";
import { idParams } from "../validators/common";
import { createVideoBody, listVideosQuery, patchVideoBody, putVideoBody } from "../validators/video.validators";
 
const router = Router();
 
// Consultar es publico, publicar exige que esten logueados, editar y eliminar que sean autor o admin
// authorId se ignora si el cliente lo manda ya que el autor es el usuario logueado.
router
  .route("/")
  .get(validate({ query: listVideosQuery }), getAllVideos)
  .post(requireAuth, ignoreBodyFields("authorId"), validate({ body: createVideoBody }), createVideo);

router
  .route("/:id")
  .get(validate({ params: idParams }), getVideoById)
  .put(requireAuth, videoOwnerOrAdmin, ignoreBodyFields("authorId"), validate({ params: idParams, body: putVideoBody }), updateVideo)
  .patch(requireAuth, videoOwnerOrAdmin, ignoreBodyFields("authorId"), validate({ params: idParams, body: patchVideoBody }), patchVideo)
  .delete(requireAuth, videoOwnerOrAdmin, validate({ params: idParams }), deleteVideo);

export default router;
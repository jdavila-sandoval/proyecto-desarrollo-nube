import { Router } from "express";
import {
  getAllComments,
  createComment,
  getCommentById,
  updateComment,
  patchComment,
  deleteComment,
} from "../controllers/comment.controller";
import { validate } from "../middleware/validate.middleware";
import { requireAuth } from "../middleware/auth.middleware.js";
import { ignoreBodyFields, commentOwner, commentOwnerOrAdmin } from "../middleware/ownership.middleware.js";
import { idParams } from "../validators/common";
import {
  createCommentBody,
  listCommentsQuery,
  putCommentBody,
  patchCommentBody,
} from "../validators/comment.validators";

const router = Router();

// Consultar es publico, comentar exige estar logueado; editar, ser el autor; eliminar, ser el autor o admin.
// authorId se ignora si el cliente lo manda por que el autor es el usuario logueado.
router
  .route("/")
  .get(validate({ query: listCommentsQuery }), getAllComments)
  .post(requireAuth, ignoreBodyFields("authorId"), validate({ body: createCommentBody }), createComment);

router
  .route("/:id")
  .get(validate({ params: idParams }), getCommentById)
  .put(requireAuth, commentOwner, validate({ params: idParams, body: putCommentBody }), updateComment)
  .patch(requireAuth, commentOwner, validate({ params: idParams, body: patchCommentBody }), patchComment)
  .delete(requireAuth, commentOwnerOrAdmin, validate({ params: idParams }), deleteComment);

export default router;

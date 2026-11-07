import { Router } from "express";
import {
  getAllReactions,
  createReaction,
  getReactionById,
  updateReaction,
  patchReaction,
  deleteReaction,
} from "../controllers/reaction.controller";
import { validate } from "../middleware/validate.middleware";
import { requireAuth } from "../middleware/auth.middleware.js";
import { ignoreBodyFields, reactionOwner, reactionOwnerOrAdmin } from "../middleware/ownership.middleware.js";
import { idParams } from "../validators/common";
import { createReactionBody, listReactionsQuery } from "../validators/reaction.validator";

const router = Router();

// Todas las rutas exigen sesion, el listado se filtra por usuario, cada usuario ve la suya y el admin ve todas
// 'user' se ignora si el cliente es quien lo manda, el dueño de la reaccion es el usuario con sesion
router
  .route("/")
  .get(requireAuth,validate({ query: listReactionsQuery }), getAllReactions)
  .post(requireAuth, ignoreBodyFields("user"), validate({ body: createReactionBody }), createReaction);

router
  .route("/:id")
  .get(requireAuth, reactionOwnerOrAdmin, validate({ params: idParams }), getReactionById)
  .put(requireAuth, validate({ params: idParams }), updateReaction)
  .patch(requireAuth, validate({ params: idParams }), patchReaction)
  .delete(requireAuth, reactionOwner, validate({ params: idParams }), deleteReaction);

export default router;

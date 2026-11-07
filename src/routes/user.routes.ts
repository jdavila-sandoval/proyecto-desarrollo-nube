import { Router } from "express";
import {
  getAllUsers,
  createUser,
  getUserById,
  getUserVideos,
  updateUser,
  changeUserRole,
  deleteUser,
} from "../controllers/user.controller";
import { validate } from "../middleware/validate.middleware";
import { requireAuth, allowRoles } from "../middleware/auth.middleware.js";
import { requireSelf } from "../middleware/ownership.middleware.js";
import { idParams } from "../validators/common";
import {
  createUserBody,
  listUsersQuery,
  patchUserBody,
  putUserBody,
  roleBody,
} from "../validators/user.validators";
 
const router = Router();

router
  .route("/")
  .get(requireAuth, allowRoles("admin"), validate({ query: listUsersQuery }), getAllUsers)
  .post(requireAuth, allowRoles("admin"), validate({ body: createUserBody }), createUser);

router.get("/:id/videos", validate({ params: idParams }), getUserVideos);

router.patch(
  "/:id/role",
  requireAuth,
  allowRoles("admin"),
  validate({ params: idParams, body: roleBody }),
  changeUserRole
);

router
  .route("/:id")
  .get(validate({ params: idParams }), getUserById)
  .put(requireAuth, requireSelf(), validate({ params: idParams, body: putUserBody }), updateUser)
  .patch(requireAuth, requireSelf(), validate({ params: idParams, body: patchUserBody }), updateUser)
  .delete(requireAuth, requireSelf({ allowAdmin: true }), validate({ params: idParams }), deleteUser);

export default router;


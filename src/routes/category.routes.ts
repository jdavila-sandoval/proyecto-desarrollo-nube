import { Router } from "express";
import {
  getAllCategories,
  createCategory,
  getCategoryById,
  updateCategory,
  patchCategory,
  deleteCategory,
} from "../controllers/category.controller";
import { validate } from "../middleware/validate.middleware";
import { requireAuth, allowRoles } from "../middleware/auth.middleware.js";
import { ignoreBodyFields } from "../middleware/ownership.middleware.js";
import { idParams } from "../validators/common";
import { createCategoryBody, patchCategoryBody, putCategoryBody } from "../validators/category.validators";

const router = Router();

// Crear, editar y eliminar categorias solo es posible por el admin. Consultarlas es publico
// CreatedBy se ignora si el cliente lo manda, el creador es el admin con sesion.
router
  .route("/")
  .get(getAllCategories)
  .post(requireAuth, allowRoles("admin"), ignoreBodyFields("createdBy"), validate({ body: createCategoryBody }), createCategory);

router
  .route("/:id")
  .get(validate({ params: idParams }), getCategoryById)
  .put(requireAuth, allowRoles("admin"), ignoreBodyFields("createdBy"), validate({ params: idParams, body: putCategoryBody }), updateCategory)
  .patch(requireAuth, allowRoles("admin"), ignoreBodyFields("createdBy"), validate({ params: idParams, body: patchCategoryBody }), patchCategory)
  .delete(requireAuth, allowRoles("admin"), validate({ params: idParams }), deleteCategory);

export default router;

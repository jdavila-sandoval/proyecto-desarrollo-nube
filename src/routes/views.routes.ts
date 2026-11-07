import { Router } from "express";
import { home, listVideos, videoDetail } from "../controllers/view.controller";
import { loginPage, registerPage, logoutView, loginView, registerView, profilePage, adminPage } from "../controllers/view-auth.controller";
import { requireAuthView, allowRoles } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware";
import { idParams } from "../validators/common";
import { viewVideosQuery } from "../validators/video.validators";
import { loginBody, registerBody } from "../validators/user.validators";

const router = Router();

router.get("/", home);
router.get("/login", loginPage);
router.post("/login", validate({ body: loginBody }), loginView);
router.get("/register", registerPage);
router.post("/register", validate({ body: registerBody }), registerView);
router.post("/logout", logoutView);
router.get("/profile", requireAuthView, profilePage);
// Vista solo para admin, sin sesion redirige a /login, con sesion de usuario normal responde 03
router.get("/admin", requireAuthView, allowRoles("admin"), adminPage);
router.get("/videos", validate({ query: viewVideosQuery }), listVideos);
router.get("/videos/:id", validate({ params: idParams }), videoDetail);

export default router;

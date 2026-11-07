import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import passport from "passport";
import { login, register, me, logout, googleCallback } from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { AppError } from "../middleware/error.middleware.js";
import { isGoogleConfigured } from "../config/passport.js";
import { loginBody, registerBody } from "../validators/user.validators.js";

const router = Router();

// Si faltan las credenciales de Google en el .env, el flujo OAuth responde 503 en lugar de fallar con un error interno
const requireGoogleConfigured = (_req: Request, _res: Response, next: NextFunction): void => {
  if (isGoogleConfigured()) return next();
  next(new AppError(503, "El inicio de sesión con Google no está configurado en el servidor"));
};

// Endpoints públicos de autenticación con credenciales
router.post("/register", validate({ body: registerBody }), register);
router.post("/login", validate({ body: loginBody }), login);

// Endpoints protegidos por sesión
router.get("/me", requireAuth, me);
router.post("/logout", requireAuth, logout);

// Flujo OAuth 2.0 con Google
router.get(
  "/google", 
  requireGoogleConfigured, 
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);
router.get(
  "/google/callback",
  requireGoogleConfigured,
  passport.authenticate("google", { failureRedirect: "/login?error=oauth", session: false }),
  googleCallback
);

export default router;

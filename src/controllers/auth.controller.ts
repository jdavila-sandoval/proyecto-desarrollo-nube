import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { UserModel, IUser } from "../models/User.model.js";
import { AppError } from "../middleware/error.middleware.js";
import { signSessionToken, setSessionCookie, clearSessionCookie } from "../config/session.js";

const SALT_ROUNDS = 10;

/**
 * POST /api/auth/register
 * Crea un usuario nuevo con contraseña cifrada y rol default 'user'.
 * Si el correo o username ya existen, el índice único de MongoDB lanza 11000 y el error.middleware responde 409.
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  const { password, ...data } = req.body;
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Forzar rol user por defecto (nunca permitir que el cliente lo defina en registro)
  const user = await UserModel.create({
    ...data,
    role: "user",
    passwordHash,
  });

  res.status(201).json(user);
};

/**
 * POST /api/auth/login
 * Inicia sesión verificando credenciales con bcrypt.
 * Si fallan, responde 401 con mensaje genérico ("Correo o contraseña incorrectos").
 * Si es válido, genera el token JWT con sub y role, y además setea una cookie httpOnly.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email }).select("+passwordHash");
  if (!user || !user.passwordHash) {
    throw new AppError(401, "Correo o contraseña incorrectos");
  }

  const esValida = await bcrypt.compare(password, user.passwordHash);
  if (!esValida) {
    throw new AppError(401, "Correo o contraseña incorrectos");
  }

  const token = signSessionToken(user);
  setSessionCookie(res, token);

  res.status(200).json({ token, user });
};

/**
 * GET /api/auth/me
 * Retorna los datos del usuario autenticado en la sesión actual (sin contraseña).
 */
export const me = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new AppError(401, "No autenticado");
  }
  res.status(200).json(req.user);
};

/**
 * POST /api/auth/logout
 * Invalida la sesión del cliente eliminando la cookie de autenticación.
 */
export const logout = async (_req: Request, res: Response): Promise<void> => {
  clearSessionCookie(res);
  res.status(200).json({ message: "Sesión cerrada correctamente" });
};

/**
 * Callback de Google OAuth 2.0
 * Genera el JWT del usuario autenticado y lo redirige a /profile
 */
export const googleCallback = async (req: Request, res: Response): Promise<void> => {
  const user = req.user as IUser;
  if (!user) {
    res.redirect("/login?error=oauth");
    return;
  }

  setSessionCookie(res, signSessionToken(user));

  res.redirect("/profile");
};

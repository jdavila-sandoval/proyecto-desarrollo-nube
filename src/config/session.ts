import jwt from "jsonwebtoken";
import type { CookieOptions, Response } from "express";
import type { IUser } from "../models/User.model.js";
import { AppError } from "../middleware/error.middleware.js";

export const SESSION_COOKIE = "token";

// Genera el JWT de sesión.
// La duración sale de JWT_EXPIRES_IN y son por defecto 2 horas
export function signSessionToken(user: IUser): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError(500, "JWT_SECRET no configurado");
  }

  const expiresIn = (process.env.JWT_EXPIRES_IN || "2h") as jwt.SignOptions["expiresIn"];
  return jwt.sign({ sub: user._id.toString(), role: user.role }, secret, { expiresIn });
}

function cookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  };
}

// Guarda el JWT en la cookie httpOnly, la cookie dura exactamente lo mismo que el token
// se toma la expiración del propio JWT, asi que cambiando JWT_EXPIRES_IN basta para los dos.

export function setSessionCookie(res: Response, token: string): void {
  const decoded = jwt.decode(token);
  const exp = decoded && typeof decoded === "object" ? decoded.exp : undefined;
  const maxAge = exp ? Math.max(exp * 1000 - Date.now(), 0) : undefined;

  res.cookie(SESSION_COOKIE, token, maxAge === undefined ? cookieOptions() : { ...cookieOptions(), maxAge });
}

// Elimina la cookie de sesion (mismas opciones con las que se creó) 
export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE, cookieOptions());
}

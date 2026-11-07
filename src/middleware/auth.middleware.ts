import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserModel, IUser, UserRole } from "../models/User.model.js";
import { AppError } from "./error.middleware.js";

export interface JwtPayload {
  sub: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}


declare global {
  namespace Express {
    interface User extends IUser {}
    interface Request {
      user?: IUser;
    }
  }
}

/**
 * Middleware que verifica la presencia y validez de un token JWT
 * (recibido por encabezado 'Authorization: Bearer <token>' o en cookie httpOnly 'token').
 * Responde 401 si falta, si es inválido, si expiró o si el usuario referenciado ya no existe.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(new AppError(401, "No autenticado: token de sesión no proporcionado"));
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return next(new AppError(500, "JWT_SECRET no configurado en el servidor"));
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, secret) as JwtPayload;
    } catch (err: any) {
      if (err?.name === "TokenExpiredError") {
        return next(new AppError(401, "El token de sesión ha expirado"));
      }
      return next(new AppError(401, "Token de sesión inválido"));
    }

    if (!decoded || !decoded.sub) {
      return next(new AppError(401, "Token con estructura inválida"));
    }

    const user = await UserModel.findById(decoded.sub);
    if (!user) {
      return next(new AppError(401, "El usuario asociado a la sesión ya no existe"));
    }

    req.user = user;
    res.locals.user = user.toJSON();

    return next();
  } catch (error) {
    return next(error);
  }
}

/**
 * Middleware que autoriza el acceso únicamente a los roles especificados.
 * Responde 403 Forbidden si el rol del usuario autenticado no está en la lista.
 */
export function allowRoles(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError(401, "No autenticado"));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, "No tienes permiso para realizar esta acción"));
    }
    return next();
  };
}

/**
 * Middleware opcional para vistas públicas o rutas híbridas:
 * Si existe una sesión válida (cookie o header), inyecta req.user y res.locals.user
 * para que las plantillas Handlebars muestren el estado de sesión sin bloquear la petición si no existe.
 */
export async function optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token || !process.env.JWT_SECRET) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
      if (decoded && decoded.sub) {
        const user = await UserModel.findById(decoded.sub);
        if (user) {
          req.user = user;
          res.locals.user = user.toJSON();
        }
      }
    } catch {
      // Si la cookie es inválida o expiró, la limpiamos y continuamos como visitante
      res.clearCookie("token");
    }

    return next();
  } catch {
    return next();
  }
}

/**
 * Middleware que protege las Vistas, si no hay sesion redirige al login de responder 401 en JSON
 * Usa req.user, que ya dejo optionalAuth (fue registrado globalmente en app.ts)
*/

export function requireAuthView(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.redirect("/login");
    return;
  }
  next();
}

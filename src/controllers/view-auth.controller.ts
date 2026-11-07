import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { VideoModel } from "../models/Video.model";
import { UserModel } from "../models/User.model";
import { CategoryModel } from "../models/Category.model";
import { CommentModel } from "../models/Comment.model";
import { signSessionToken, setSessionCookie, clearSessionCookie } from "../config/session.js";

export function loginPage(req: Request, res: Response) {
  res.render("auth/login", {
    title: "Iniciar sesión",
    error: 
      req.query.error === "1" 
      ? "Correo o contraseña incorrectos." 
      : req.query.error === "oauth"
        ? "No fue posible iniciar sesión con Google. Inténtalo de nuevo."
        : "",
    registered: req.query.registered === "1",
  });
}

export function registerPage(_req: Request, res: Response) {
  res.render("auth/register", { title: "Crear cuenta" });
}

export async function loginView(req: Request, res: Response) {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email }).select("+passwordHash");
  const validPassword = user && user.passwordHash ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!user || !validPassword) {
    res.status(401).render("auth/login", {
      title: "Iniciar sesión",
      error: "Correo o contraseña incorrectos.",
      email,
    });
    return;
  }

  setSessionCookie(res, signSessionToken(user));
  res.redirect("/profile");
}

export async function registerView(req: Request, res: Response) {
  const { username, email, password } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);
  await UserModel.create({ username, email, passwordHash });
  res.redirect("/login?registered=1");
}

export async function profilePage(req: Request, res: Response) {
  const user = req.user!;
  const [videos, categorias] = await Promise.all([
    VideoModel.find({ "author.userId": user._id }).sort({ publishedAt: -1 }).lean(),
    CategoryModel.find().sort({ name: 1 }).lean(), 
  ]);
  res.render("user/profile", { title: "Mi perfil", user: user.toJSON(), videos, categorias });
}

export async function adminPage(_req: Request, res: Response) {
  const [users, videos, categories, comments, ultimosUsuarios] = await Promise.all([
    UserModel.countDocuments(),
    VideoModel.countDocuments(),
    CategoryModel.countDocuments(),
    CommentModel.countDocuments(),
    UserModel.find().sort({ createdAt: -1 }).limit(8).lean(),
  ]);
  res.render("admin/dashboard", { title: "Panel de administración", users, videos, categories, comments, ultimosUsuarios });
}

export function logoutView(_req: Request, res: Response) {
  clearSessionCookie(res);
  res.redirect("/");
}
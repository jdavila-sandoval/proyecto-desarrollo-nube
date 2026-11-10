import cors from "cors";
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const PORT = Number(process.env.PORT || 3001);
const JWT_SECRET = process.env.JWT_SECRET || "edustream-development-secret";
const TOKEN_TTL = "60m";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "db.json");

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

async function readDb() {
  return JSON.parse(await fs.readFile(dbPath, "utf8"));
}

async function writeDb(db) {
  await fs.writeFile(dbPath, `${JSON.stringify(db, null, 2)}\n`, "utf8");
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

function createToken(user) {
  return jwt.sign({ sub: user.id, role: user.role, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ message: "Debes iniciar sesión para continuar." });
  try {
    req.auth = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Tu sesión expiró o el token no es válido." });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.auth.role)) return res.status(403).json({ message: "No tienes permisos para realizar esta acción." });
    next();
  };
}

app.post("/auth/register", async (req, res) => {
  const { name, email, password, role = "alumno" } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: "Nombre, correo y contraseña son obligatorios." });
  if (!["alumno", "docente"].includes(role)) return res.status(400).json({ message: "El rol seleccionado no es válido." });
  const db = await readDb();
  if (db.users.some((user) => user.email.toLowerCase() === email.toLowerCase())) return res.status(409).json({ message: "El correo ya está registrado." });
  const user = { id: `u-${Date.now()}`, name, email: email.toLowerCase(), passwordHash: await bcrypt.hash(password, 10), role };
  db.users.push(user);
  await writeDb(db);
  res.status(201).json({ user: publicUser(user), token: createToken(user) });
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const db = await readDb();
  const user = db.users.find((item) => item.email.toLowerCase() === String(email || "").toLowerCase());
  if (!user || !(await bcrypt.compare(password || "", user.passwordHash))) return res.status(401).json({ message: "Correo o contraseña incorrectos." });
  res.json({ user: publicUser(user), token: createToken(user) });
});

app.get("/auth/me", authenticate, async (req, res) => {
  const db = await readDb();
  const user = db.users.find((item) => item.id === req.auth.sub);
  if (!user) return res.status(401).json({ message: "La sesión ya no corresponde a un usuario válido." });
  res.json({ user: publicUser(user) });
});

app.get("/videos", authenticate, async (req, res) => {
  const db = await readDb();
  res.json(db.videos);
});

app.get("/videos/:id", authenticate, async (req, res) => {
  const db = await readDb();
  const video = db.videos.find((item) => String(item.id) === req.params.id);
  if (!video) return res.status(404).json({ message: "Video no encontrado." });
  res.json(video);
});

app.post("/videos", authenticate, requireRole("docente"), async (req, res) => {
  const db = await readDb();
  const video = { id: Date.now(), ...req.body, duration: "00:00", uploadedAt: new Date().toLocaleDateString("es-MX"), views: 0, thumbnailClass: "thumb-blue" };
  db.videos.push(video);
  await writeDb(db);
  res.status(201).json(video);
});

app.patch("/videos/:id", authenticate, requireRole("docente"), async (req, res) => {
  const db = await readDb();
  const index = db.videos.findIndex((item) => String(item.id) === req.params.id);
  if (index < 0) return res.status(404).json({ message: "Video no encontrado." });
  db.videos[index] = { ...db.videos[index], ...req.body };
  await writeDb(db);
  res.json(db.videos[index]);
});

app.delete("/videos/:id", authenticate, requireRole("docente"), async (req, res) => {
  const db = await readDb();
  const originalLength = db.videos.length;
  db.videos = db.videos.filter((item) => String(item.id) !== req.params.id);
  if (db.videos.length === originalLength) return res.status(404).json({ message: "Video no encontrado." });
  await writeDb(db);
  res.status(204).end();
});

app.listen(PORT, () => console.log(`EduStream API disponible en http://localhost:${PORT}`));

import { z } from "zod";
import { alMenosUnCampo, MENSAJE_ALMENOS_UNO, urlOpcional } from "./common";

const camposPerfil = {
  username: z
    .string()
    .trim()
    .min(3, "Debe tener entre 3 y 30 caracteres")
    .max(30, "Debe tener entre 3 y 30 caracteres"),
  email: z.string().trim().toLowerCase().email("Debe ser un correo válido"),
  password: z
    .string()
    .min(8, "Debe tener entre 8 y 72 caracteres")
    .max(72, "Debe tener entre 8 y 72 caracteres"),
  description: z.string().trim().max(300, "Máximo 300 caracteres").optional(),
  profileImage: urlOpcional.optional(),
};

// El rol NO forma parte del perfil, solo un admin lo puede cambiar (POST /users y PATCH /users/:id/role)
const campos = { ...camposPerfil, role: z.enum(["user", "admin"]).optional() };

// POST /users -  solo para el admin, el puede asignar el rol
export const createUserBody = z.object(campos).strict();

// Registro desde las vistas. Datos de rol y perfil se asignan por el servidor.
export const registerBody = createUserBody.omit({ role: true, description: true, profileImage: true });

// PUT /users/:id  - solo el dueño, sin role, en caso que se envie responde 400
export const putUserBody = z
  .object({ ...camposPerfil, password: camposPerfil.password.optional() })
  .strict();

// PATCH /users/:id  cualquier conjunto de campos, pero debe ser minimo uno
export const patchUserBody = z
  .object(camposPerfil)
  .partial()
  .strict()
  .refine(alMenosUnCampo, MENSAJE_ALMENOS_UNO);

// PATCH /users/:id/role solo admins
export const roleBody = z.object({ role: z.enum(["user", "admin"]) }).strict();

// GET /users?role=
export const listUsersQuery = z
  .object({ role: z.enum(["user", "admin"]).optional() })
  .strict();

// POST /auth/login
export const loginBody = z
  .object({
    email: z.string().trim().toLowerCase().email("Debe ser un correo válido"),
    password: z.string().min(1, "Es obligatorio"),
  })
  .strict();
import { z } from "zod";

//id de mongoDB
export const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Debe ser un id válido (24 caracteres hexadecimales)");

//Este es para hacer los esquemas de las rutas con /:id
export const idParams = z.object({ id: objectId });

function esUrlHttp(valor: string): boolean {
  try {
    const url = new URL(valor);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const MENSAJE_URL = "Debe ser una URL válida (http o https)";

// permite omitir la URL o enviarla vacía
export const urlOpcional = z
  .string()
  .trim()
  .refine((v) => v === "" || esUrlHttp(v), MENSAJE_URL);

// Patch
export const alMenosUnCampo = (obj: object): boolean => Object.keys(obj).length > 0;
export const MENSAJE_ALMENOS_UNO = "Debe enviar al menos un campo para actualizar";
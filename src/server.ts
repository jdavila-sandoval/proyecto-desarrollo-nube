import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";

const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/videohub";
const cloudMode = process.env.CLOUD_MODE === "true";

// Validación de variables críticas: Si falta JWT_SECRET el servidor no arranca
if (!process.env.JWT_SECRET) {
  console.error("\n[VideoHub Error]: La variable de entorno JWT_SECRET no está definida.");
  console.error("Copia .env.example a .env y define un secreto seguro para JWT.");
  process.exit(1);
}

async function start() {
  if (!cloudMode) {
    try {
      if (!mongoUri) {
        throw new Error("La variable de entorno MONGODB_URI no está definida (copia .env.example a .env)");
      }
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });

      await Promise.all(Object.values(mongoose.models).map((model) => model.init()));
      console.log("Conexión a MongoDB establecida");
    } catch (error) {
      console.error("\nNo fue posible conectar con MongoDB.");
      console.error(`  Motivo: ${error instanceof Error ? error.message : error}`);
      console.error("  Verifica MONGODB_URI en tu .env y que la base de datos esté levantada (ver README).\n");
      process.exit(1);
    }
  } else {
    console.log("CLOUD_MODE activo: se omitió la conexión a MongoDB.");
  }

  app.listen(port, () => {
    console.log(`VideoHub disponible en http://localhost:${port}`);
    console.log(`API REST en http://localhost:${port}/api`);
  });
}

start();

import "dotenv/config";
import path from "path";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import { engine } from "express-handlebars";
import apiRoutes from "./routes/index.js";
import viewRoutes from "./routes/views.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";
import { configurePassport } from "./config/passport.js";
import { optionalAuth } from "./middleware/auth.middleware.js";

const app = express();

const rootDir = path.resolve(__dirname, "..");

// Inicializar estrategias de Passport (Google OAuth 2.0)
configurePassport();

app.engine(
  "handlebars",
  engine({
    helpers: {
      fecha: (value: unknown) => {
        const date = value instanceof Date ? value : new Date(String(value));

        if (Number.isNaN(date.getTime())) {
          return "Fecha no disponible";
        }

        return new Intl.DateTimeFormat("es-MX", {
          dateStyle: "medium",
        }).format(date);
      },
      igual: (a: unknown, b: unknown) => String(a) === String(b),
    },
  }),
);
app.set("view engine", "handlebars");
app.set("views", path.join(rootDir, "views"));

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(express.static(path.join(rootDir, "public")));

// optionalAuth permite que las vistas y layout reconozcan si el usuario tiene sesión activa
app.use(optionalAuth);

app.use("/api", apiRoutes);
app.use("/", viewRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

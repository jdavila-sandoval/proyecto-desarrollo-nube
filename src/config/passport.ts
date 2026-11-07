import passport from "passport";
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from "passport-google-oauth20";
import { UserModel } from "../models/User.model.js";

// Las tres variables son obligatorias para el login con Google.
// Si falta alguna, el login con Google queda deshabilitado y las rutas /api/auth/google responden 503.

export function isGoogleConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CALLBACK_URL
  );
}

// Google marca el correo con verified: true, dependiendo de la version puede llegar como "true"
function isVerifiedEmail(entry: unknown): boolean {
  const verified = (entry as { verified?: unknown } | undefined)?.verified;
  return verified === true || verified === "true";
}

export function configurePassport(): void {
  if (!isGoogleConfigured()) {
    console.warn(
      "[VideoHub] Login con Google deshabilitado: define GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET y GOOGLE_CALLBACK_URL en el .env (ver README)."
    );
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
        scope: ["profile", "email"],
      },
      async (_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback) => {
        try {
          const googleId = profile.id;
          const verifiedEntry = profile.emails?.find(isVerifiedEmail);
          const email = (verifiedEntry ?? profile.emails?.[0])?.value?.toLowerCase();

          // 1. Buscar si ya existe un usuario con este googleId
          let user = await UserModel.findOne({ googleId });
          if (user) {
            return done(null, user);
          }

          // 2. Si no tiene googleId, buscar por correo (solo si el proveedor lo marca como verificado)
          if (email && verifiedEntry) {
            user = await UserModel.findOne({ email });
            if (user) {
              user.googleId = googleId;
              await user.save();
              return done(null, user);
            }
          }

          // Un correo SIN verificar que ya pertenece a otra cuenta no se vincula ni se duplica: se rechaza el acceso
          if (email && (await UserModel.exists({ email }))) {
            return done(null, false);
          }

          // 3. Si no existe, crear con el rol por defecto (user) y sin contraseña
          let baseUsername = (profile.displayName || profile.name?.givenName || email?.split("@")[0] || "google_user")
            .trim()
            .toLowerCase()
            .replace(/[^a-zA-Z0-9_]/g, "_")
            .slice(0, 24);

          if (baseUsername.length < 3) {
            baseUsername = `user_${googleId.slice(0, 6)}`;
          }

          // Garantizar username único
          let candidateUsername = baseUsername;
          let counter = 1;
          while (await UserModel.exists({ username: candidateUsername })) {
            candidateUsername = `${baseUsername.slice(0, 20)}_${counter}`;
            counter++;
          }

          const newUser = await UserModel.create({
            username: candidateUsername,
            email: email || `${googleId}@google.oauth`,
            googleId,
            role: "user",
            description: "Usuario registrado a través de Google OAuth",
            profileImage: profile.photos?.[0]?.value || "",
          });

          return done(null, newUser);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
}

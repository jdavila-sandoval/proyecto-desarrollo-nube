import { Schema, model, Document } from "mongoose";

export type UserRole = "user" | "admin";

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash?: string;
  googleId?: string;
  description?: string;
  profileImage?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: false,
      select: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    description: {
      type: String,
      default: "",
      maxlength: 300,
    },
    profileImage: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
    toJSON: {
      // Garantiza que el hash de la contraseña, el googleId y la versión interna nunca salgan en las respuestas JSON
      transform: (_doc: unknown, ret: Record<string, any>) => {
        delete ret.passwordHash;
        delete ret.googleId;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: (_doc: unknown, ret: Record<string, any>) => {
        delete ret.passwordHash;
        delete ret.googleId;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const UserModel = model<IUser>("User", UserSchema);

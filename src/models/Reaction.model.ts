import { Schema, model, Document, Types } from "mongoose";

// Este type corresponde a los tipos de reaccion que va a soportar el sistema
// De momento se dejara como un enum para en un futuro agregar mas tipos 
export type ReactionType = "like";


export interface IReaction extends Document {
  video: Types.ObjectId; // ref -> Video
  user: Types.ObjectId; // ref -> User
  type: ReactionType;
  createdAt: Date;
}

const ReactionSchema = new Schema<IReaction>(
  {
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["like"],
      default: "like",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // una reacción no se debe editar, solo se crea o elimina
  }
);

// Evita que un mismo usuario reaccione dos veces al mismo video
ReactionSchema.index({ video: 1, user: 1 }, { unique: true });

export const ReactionModel = model<IReaction>("Reaction", ReactionSchema);
import { Schema, model, Document, Types } from "mongoose";


export interface ICommentAuthorSnapshot {
  userId: Types.ObjectId; // ref -> User
  username: string;
}

export interface IComment extends Document {
  video: Types.ObjectId; // ref -> Video
  author: ICommentAuthorSnapshot;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommentAuthorSchema = new Schema<ICommentAuthorSnapshot>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const CommentSchema = new Schema<IComment>(
  {
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    author: {
      type: CommentAuthorSchema,
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

// Índice de apoyo para consultar rápidamente los comentarios de un video
CommentSchema.index({ video: 1, createdAt: -1 });

export const CommentModel = model<IComment>("Comment", CommentSchema);
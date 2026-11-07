import { Schema, model, Document, Types } from "mongoose";

export interface IVideoAuthorSnapshot {
  userId: Types.ObjectId; // ref -> User
  username: string;
}


export interface IVideoCategorySnapshot {
  categoryId: Types.ObjectId; // ref -> Category
  name: string;
}

export interface IVideo extends Document {
  title: string;
  description?: string;
  author: IVideoAuthorSnapshot;
  category: IVideoCategorySnapshot;
  videoUrl: string;
  thumbnailUrl?: string;
  views: number;
  likesCount: number;
  publishedAt: Date;
  updatedAt: Date;
}

const VideoAuthorSchema = new Schema<IVideoAuthorSnapshot>(
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
  { _id: false } // es un subdocumento embebido, por eso no es necesario que le añadamos su propia id
);

const VideoCategorySchema = new Schema<IVideoCategorySnapshot>(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const VideoSchema = new Schema<IVideo>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      default: "",
      maxlength: 2000,
    },
    author: {
      type: VideoAuthorSchema,
      required: true,
    },
    category: {
      type: VideoCategorySchema,
      required: true,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      default: "",
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    likesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: { createdAt: "publishedAt", updatedAt: "updatedAt" },
  }
);

// Indices de apoyo para búsqueda, filtrado y ordenamiento 
VideoSchema.index({ title: "text" });
VideoSchema.index({ "category.categoryId": 1 });
VideoSchema.index({ publishedAt: -1 });
VideoSchema.index({ views: -1 });

export const VideoModel = model<IVideo>("Video", VideoSchema);
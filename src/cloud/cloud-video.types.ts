export interface CloudVideo {
  videoId: string;
  title: string;
  description: string;
  category: string;
  videoUrl: string;
  thumbnailUrl: string;
  views: number;
  publishedAt: string;
}

export interface CreateCloudVideoInput {
  title: string;
  description?: string;
  category: string;
  videoUrl: string;
  thumbnailUrl?: string;
}

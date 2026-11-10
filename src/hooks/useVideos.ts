import { useCallback, useEffect, useState } from "react";
import { videoService } from "../services/videoService";
import type { VideoItem } from "../types";

export function useVideos() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setVideos(await videoService.list());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudieron cargar los videos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);
  return { videos, setVideos, loading, error, reload: load };
}

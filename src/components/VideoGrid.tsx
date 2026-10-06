import type { Video } from "@/lib/types";
import VideoCard from "./VideoCard";

/**
 * Mobile: 1 column x 24 rows.
 * Desktop (xl): 4 columns x 6 rows.
 * sm/lg are sensible in-between steps so tablets aren't left with a single column.
 */
export default function VideoGrid({ videos }: { videos: Video[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {videos.map((v) => (
        <VideoCard key={v.id} video={v} />
      ))}
    </div>
  );
}

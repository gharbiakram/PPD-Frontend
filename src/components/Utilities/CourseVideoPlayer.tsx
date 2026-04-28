import React, { useEffect, useRef } from "react";
import Hls from "hls.js";
import { isStreamingVideo, resolveMediaUrl } from '@/lib/mediaUrl';

interface CourseVideoPlayerProps {
  videoUrl: string;
}

const CourseVideoPlayer: React.FC<CourseVideoPlayerProps> = ({ videoUrl }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!videoUrl || !videoRef.current) return;

    const resolvedUrl = resolveMediaUrl(videoUrl);
    const videoElement = videoRef.current;

    if (!isStreamingVideo(resolvedUrl)) {
      videoElement.src = resolvedUrl;
      return;
    }

    // If the browser supports HLS natively (Safari)
    if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
      videoElement.src = resolvedUrl;
    }
    // Otherwise, use hls.js
    else if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(resolvedUrl);
      hls.attachMedia(videoElement);

      // Cleanup on unmount
      return () => {
        hls.destroy();
      };
    } else {
      console.error("HLS is not supported in this browser.");
    }
  }, [videoUrl]);

  return (
    <video
      ref={videoRef}
      controls
      controlsList="nodownload"
      onContextMenu={(e) => e.preventDefault()}
      disablePictureInPicture
      className="rounded-lg"
      style={{ width: "100%", height: "auto" }}
    >
      Sorry, your browser doesn't support video playback.
    </video>
  );
};

export default CourseVideoPlayer;

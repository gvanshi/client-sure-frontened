"use client";

import { useRef } from "react";
import { X } from "lucide-react";

interface VideoViewerProps {
  url: string;
  title?: string;
  onClose?: () => void;
  className?: string; // Added className
  showControls?: boolean; // Added showControls
  autoPlay?: boolean; // Added autoPlay
}

function getYouTubeEmbedUrl(
  url: string,
  autoPlay: boolean = true,
): string | null {
  try {
    if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
      return null;
    }

    let videoId = "";

    if (url.includes("v=")) {
      const urlParams = new URLSearchParams(url.split("?")[1]);
      videoId = urlParams.get("v") || "";
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1].split("?")[0];
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay ? 1 : 0}&rel=0&modestbranding=1`;
    }

    return null;
  } catch (e) {
    console.error("Error parsing YouTube URL:", e);
    return null;
  }
}

export default function VideoViewer({
  url,
  title,
  onClose,
  className = "",
  showControls = true,
  autoPlay = true,
}: VideoViewerProps) {
  // Calculate embed URL once and store in ref - never recalculates
  const embedUrlRef = useRef(getYouTubeEmbedUrl(url, autoPlay));
  const embedUrl = embedUrlRef.current;
  const isYouTube = embedUrl !== null;

  return (
    <div
      className={`h-full w-full flex items-center justify-center relative bg-black ${className}`}
    >
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 bg-white/90 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          title="Close Viewer"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>
      )}

      {isYouTube ? (
        <iframe
          className="w-full h-full"
          src={embedUrl}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          title={title || "Video player"}
          frameBorder="0"
        />
      ) : (
        <video
          controls={showControls}
          autoPlay={autoPlay}
          className="max-w-full max-h-full"
          src={url}
          playsInline
        >
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
}

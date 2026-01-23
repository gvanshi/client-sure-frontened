"use client";

import { useEffect } from "react";
import PDFViewer from "@/components/PDFViewer";
import VideoViewer from "@/components/VideoViewer";

interface Resource {
  _id: string;
  title: string;
  description: string;
  type: "pdf" | "video";
  url: string;
  thumbnailUrl?: string;
  isActive: boolean;
  createdAt: string;
  isAccessedByUser: boolean;
}

interface ResourceModalProps {
  resource: Resource;
  onClose: () => void;
}

export default function ResourceModal({
  resource,
  onClose,
}: ResourceModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black animate-in fade-in duration-200">
      <div className="w-full h-full flex flex-col bg-black">
        {/* Content */}
        <div className="flex-1 relative bg-gray-100 overflow-hidden">
          {resource.type === "pdf" ? (
            <PDFViewer
              url={resource.url}
              title={resource.title}
              showDownload={false}
              showExternal={true}
              showTitle={false}
              onClose={onClose}
              className="h-full w-full"
            />
          ) : (
            <VideoViewer
              url={resource.url}
              title={resource.title}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}

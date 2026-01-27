"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface BackButtonProps {
  className?: string;
  label?: string;
}

export default function BackButton({
  className = "",
  label = "Back",
}: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className={`flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors py-2 px-1 rounded-lg hover:bg-gray-100/50 ${className}`}
      aria-label="Go back"
    >
      <ArrowLeft className="w-5 h-5" />
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
}

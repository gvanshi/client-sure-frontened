"use client";

import { useState, useEffect } from "react";
import { ArrowRight, X } from "lucide-react";

export default function StickyBottomBar() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling down 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isClosed || !isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-xl z-50 py-4 px-6 animate-in slide-in-from-bottom duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left Content */}
        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
          <h3 className="font-bold text-gray-900 text-sm md:text-base">
            Ready to get global clients?
          </h3>
          <p className="hidden md:block text-xs text-gray-400 font-medium">
            100 tokens daily • Start reaching global clients
          </p>
        </div>

        {/* Right Content */}
        <div className="flex items-center gap-4">
          <button className="bg-[#F85E2E] hover:bg-[#E04D1F] text-white font-bold py-2.5 px-6 rounded-lg text-sm transition-colors flex items-center gap-2">
            Get Started Now <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsClosed(true)}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

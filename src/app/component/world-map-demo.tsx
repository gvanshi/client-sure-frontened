"use client";
import WorldMap from "@/components/ui/world-map";

export default function WorldMapDemo() {
  return (
    <div className="py-20 lg:py-40 bg-white w-full">
      <div className="max-w-7xl mx-auto text-center px-6">
        <p className="text-sm font-semibold text-[#1C9988] tracking-wide uppercase">
          Global Coverage
        </p>
        <h2 className="font-bold text-4xl md:text-5xl text-black mt-2 mb-4">
          Clients from Around the World
        </h2>
        <p className="text-base md:text-lg text-neutral-600 max-w-2xl mx-auto">
          Access verified business contacts from major markets.
          <br />
          Your next client could be anywhere.
        </p>
      </div>

      <div className="max-w-7xl mx-auto mt-10 w-full">
        <WorldMap
          dots={[
            {
              start: { lat: 64.2008, lng: -149.4937, label: "Alaska" },
              end: { lat: 37.7749, lng: -122.4194, label: "Los Angeles" },
            },
            {
              start: { lat: 37.7749, lng: -122.4194 },
              end: {
                lat: 51.5074,
                lng: -0.1278,
                label: "London",
                labelDy: -30,
              }, // London label moved up
            },
            {
              start: { lat: 51.5074, lng: -0.1278 },
              end: { lat: 48.8566, lng: 2.3522, label: "Paris", labelDy: 5 }, // Paris slightly down
            },
            {
              start: { lat: 48.8566, lng: 2.3522 },
              end: {
                lat: 51.1657,
                lng: 10.4515,
                label: "Germany",
                labelDx: 20,
              }, // Germany moved right
            },
            {
              start: { lat: 51.1657, lng: 10.4515 },
              end: { lat: 24.4539, lng: 54.3773, label: "UAE" },
            },
            {
              start: { lat: 24.4539, lng: 54.3773 },
              end: { lat: 1.3521, lng: 103.8198, label: "Singapore" },
            },
            {
              start: { lat: 1.3521, lng: 103.8198 },
              end: { lat: -25.2744, lng: 133.7751, label: "Australia" },
            },
          ]}
        />
      </div>

      <div className="max-w-7xl mx-auto mt-8 text-center px-6">
        <div className="flex flex-wrap justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-lg">🇺🇸</span>
            <span className="text-neutral-700">USA</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🇬🇧</span>
            <span className="text-neutral-700">UK</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🇦🇪</span>
            <span className="text-neutral-700">UAE</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🇦🇺</span>
            <span className="text-neutral-700">Australia</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🇨🇦</span>
            <span className="text-neutral-700">Canada</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🇸🇬</span>
            <span className="text-neutral-700">Singapore</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🇩🇪</span>
            <span className="text-neutral-700">Germany</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🇫🇷</span>
            <span className="text-neutral-700">France</span>
          </div>
        </div>
      </div>
    </div>
  );
}

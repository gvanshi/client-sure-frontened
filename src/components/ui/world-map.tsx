"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import DottedMap from "dotted-map";

interface MapProps {
  dots?: Array<{
    start: {
      lat: number;
      lng: number;
      label?: string;
      labelDx?: number;
      labelDy?: number;
    };
    end: {
      lat: number;
      lng: number;
      label?: string;
      labelDx?: number;
      labelDy?: number;
    };
  }>;
  lineColor?: string;
}

export default function WorldMap({
  dots = [],
  lineColor = "#1C9988",
}: MapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const map = new DottedMap({ height: 100, grid: "diagonal" });

  const svgMap = map.getSVG({
    radius: 0.22,
    color: "#4B5563", // Dark gray (gray-600)
    shape: "circle",
    backgroundColor: "transparent",
  });

  const projectPoint = (lat: number, lng: number) => {
    const x = (lng + 180) * (800 / 360);
    const y = (-1 * lat + 90) * (400 / 180);
    return { x, y };
  };

  const createCurvedPath = (
    start: { x: number; y: number },
    end: { x: number; y: number },
  ) => {
    const midX = (start.x + end.x) / 2;
    const midY = Math.min(start.y, end.y) - 50; // Curve upwards
    return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
  };

  // Collect unique points to render circles and labels without duplication
  const uniquePoints = new Map<
    string,
    { x: number; y: number; label?: string; labelDx?: number; labelDy?: number }
  >();

  dots.forEach((dot) => {
    const startKey = `${dot.start.lat}-${dot.start.lng}`;
    const endKey = `${dot.end.lat}-${dot.end.lng}`;

    if (!uniquePoints.has(startKey)) {
      uniquePoints.set(startKey, {
        ...projectPoint(dot.start.lat, dot.start.lng),
        label: dot.start.label,
        labelDx: dot.start.labelDx,
        labelDy: dot.start.labelDy,
      });
    }
    if (!uniquePoints.has(endKey)) {
      uniquePoints.set(endKey, {
        ...projectPoint(dot.end.lat, dot.end.lng),
        label: dot.end.label,
        labelDx: dot.end.labelDx,
        labelDy: dot.end.labelDy,
      });
    }
  });

  return (
    <div className="w-full aspect-[2/1] bg-white rounded-lg relative font-sans h-full">
      <img
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
        className="h-full w-full pointer-events-none select-none opacity-50"
        alt="world map"
        draggable={false}
      />
      <svg
        ref={svgRef}
        viewBox="0 0 800 400"
        className="w-full h-full absolute inset-0 pointer-events-none select-none"
      >
        {/* Render Lines */}
        {dots.map((dot, i) => {
          const startPoint = projectPoint(dot.start.lat, dot.start.lng);
          const endPoint = projectPoint(dot.end.lat, dot.end.lng);
          return (
            <g key={`path-group-${i}`}>
              <motion.path
                d={createCurvedPath(startPoint, endPoint)}
                fill="none"
                stroke="url(#path-gradient)"
                strokeWidth="1"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: 1,
                  delay: 0.5 * i,
                  ease: "easeOut",
                }}
              />
            </g>
          );
        })}

        {/* Render Unique Points and Labels */}
        {Array.from(uniquePoints.values()).map((point, i) => (
          <g key={`point-${i}`}>
            <motion.circle
              cx={point.x}
              cy={point.y}
              r="2"
              fill={lineColor}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 * i, duration: 0.5 }}
            />
            {point.label && (
              <motion.text
                x={point.x + (point.labelDx || 0)}
                y={point.y + 15 + (point.labelDy || 0)}
                textAnchor="middle"
                fill="#374151" // Dark gray text
                className="text-[10px] font-bold uppercase tracking-wider"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 * i, duration: 0.5 }}
              >
                {point.label}
              </motion.text>
            )}
          </g>
        ))}

        <defs>
          <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="5%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="95%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

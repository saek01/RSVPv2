"use client";

import { useEffect, useState } from "react";

type Leaf = {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  swayX: number;
  hue: 0 | 1; // 0 = lemon, 1 = leaf-green
  rotation: number;
};

// Build a single leaf's style — randomised per particle.
function buildLeaf(id: number): Leaf {
  const hue: 0 | 1 = Math.random() > 0.55 ? 1 : 0;
  return {
    id,
    left: Math.random() * 100,
    size: 14 + Math.random() * 22,
    duration: 10 + Math.random() * 14,
    delay: -Math.random() * 18,
    swayX: 60 + Math.random() * 160,
    hue,
    rotation: Math.random() * 360,
  };
}

export function FloatingLeaves({ count = 12 }: { count?: number }) {
  const [leaves, setLeaves] = useState<Leaf[]>([]);

  useEffect(() => {
    // Random particle data must be generated client-side to avoid
    // hydration mismatches (different Math.random() on server vs client).
    // This is the canonical client-only-initialization pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLeaves(Array.from({ length: count }, (_, i) => buildLeaf(i)));
  }, [count]);

  if (leaves.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {leaves.map((leaf) => (
        <span
          key={leaf.id}
          className="leaf"
          style={
            {
              left: `${leaf.left}%`,
              width: `${leaf.size}px`,
              height: `${leaf.size}px`,
              animationDuration: `${leaf.duration}s`,
              animationDelay: `${leaf.delay}s`,
              // CSS variables consumed by @keyframes float-down
              ["--leaf-x-start" as never]: "0px",
              ["--leaf-x-end" as never]: `${leaf.swayX}px`,
              opacity: 0.85,
            } as React.CSSProperties
          }
        >
          <LeafSvg hue={leaf.hue} rotate={leaf.rotation} />
        </span>
      ))}
    </div>
  );
}

function LeafSvg({ hue, rotate }: { hue: 0 | 1; rotate: number }) {
  const fill = hue === 0 ? "var(--lemon-400)" : "var(--leaf-500)";
  const stroke = hue === 0 ? "var(--lemon-600)" : "var(--leaf-700)";
  return (
    <svg
      viewBox="0 0 64 64"
      width="100%"
      height="100%"
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <path
        d="M32 4 C 12 14 6 36 12 56 C 32 52 50 36 52 18 C 50 12 42 6 32 4 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.5"
        opacity="0.85"
      />
      <path
        d="M32 4 L 18 50"
        stroke={stroke}
        strokeWidth="1.2"
        fill="none"
        opacity="0.5"
      />
    </svg>
  );
}

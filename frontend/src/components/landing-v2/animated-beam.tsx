"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";

interface BeamPath {
  id: string;
  from: string;
  to: string;
  /** Delay before animation starts (seconds) */
  delay?: number;
  /** Duration of one loop (seconds) */
  duration?: number;
  /** Gradient colors [start, end] */
  gradient?: [string, string];
  /** Reverse direction */
  reverse?: boolean;
}

interface AnimatedBeamProps {
  /** Container ref that holds all the anchor elements */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Array of beam path configs */
  paths: BeamPath[];
  /** Global opacity for all beams */
  opacity?: number;
  /** Beam stroke width */
  strokeWidth?: number;
  /** Curvature factor (0 = straight, higher = more curve) */
  curvature?: number;
}

interface Point {
  x: number;
  y: number;
}

function getCenter(el: HTMLElement, container: HTMLElement): Point {
  const elRect = el.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  return {
    x: elRect.left - containerRect.left + elRect.width / 2,
    y: elRect.top - containerRect.top + elRect.height / 2,
  };
}

function buildCubicPath(from: Point, to: Point, curvature: number): string {
  const midX = (from.x + to.x) / 2;
  const dy = to.y - from.y;
  const offset = curvature * Math.sign(dy || 1);

  const cp1x = midX;
  const cp1y = from.y + offset;
  const cp2x = midX;
  const cp2y = to.y - offset;

  return `M ${from.x},${from.y} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${to.x},${to.y}`;
}

function Beam({
  path,
  container,
  opacity = 0.4,
  strokeWidth = 2,
  curvature = 40,
}: {
  path: BeamPath;
  container: HTMLDivElement;
  opacity: number;
  strokeWidth: number;
  curvature: number;
}) {
  const [d, setD] = useState("");
  const gradientId = `beam-grad-${path.id}`;
  const [start, end] = path.gradient || ["#eb5e28", "#9333ea"];

  const computePath = useCallback(() => {
    const fromEl = container.querySelector(`[data-beam="${path.from}"]`) as HTMLElement | null;
    const toEl = container.querySelector(`[data-beam="${path.to}"]`) as HTMLElement | null;
    if (!fromEl || !toEl) return;

    let fromPt = getCenter(fromEl, container);
    let toPt = getCenter(toEl, container);
    if (path.reverse) [fromPt, toPt] = [toPt, fromPt];

    setD(buildCubicPath(fromPt, toPt, curvature));
  }, [container, path, curvature]);

  useEffect(() => {
    computePath();
    const ro = new ResizeObserver(computePath);
    ro.observe(container);
    return () => ro.disconnect();
  }, [computePath, container]);

  if (!d) return null;

  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={start} stopOpacity={0} />
          <stop offset="30%" stopColor={start} stopOpacity={1} />
          <stop offset="70%" stopColor={end} stopOpacity={1} />
          <stop offset="100%" stopColor={end} stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Background path (faint) */}
      <path
        d={d}
        fill="none"
        stroke={start}
        strokeWidth={strokeWidth * 0.5}
        opacity={opacity * 0.2}
      />

      {/* Animated beam */}
      <motion.path
        d={d}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        opacity={opacity}
        initial={{ pathLength: 0, pathOffset: 0 }}
        animate={{
          pathLength: [0, 0.3, 0.3, 0],
          pathOffset: [0, 0.2, 0.7, 1],
        }}
        transition={{
          duration: path.duration || 5,
          delay: path.delay || 0,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </svg>
  );
}

export function AnimatedBeam({
  containerRef,
  paths,
  opacity = 0.4,
  strokeWidth = 2,
  curvature = 40,
}: AnimatedBeamProps) {
  const container = containerRef.current;
  if (!container) return null;

  return (
    <>
      {paths.map((path) => (
        <Beam
          key={path.id}
          path={path}
          container={container}
          opacity={opacity}
          strokeWidth={strokeWidth}
          curvature={curvature}
        />
      ))}
    </>
  );
}

/**
 * Wrapper that handles the container ref lifecycle for the beam renderer.
 * Use this when you want a self-contained beam system.
 */
export function AnimatedBeamContainer({
  paths,
  opacity,
  strokeWidth,
  curvature,
  className,
  children,
}: Omit<AnimatedBeamProps, "containerRef"> & {
  className?: string;
  children?: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className || ""}`}>
      {children}
      {mounted && containerRef.current && (
        <AnimatedBeam
          containerRef={containerRef}
          paths={paths}
          opacity={opacity}
          strokeWidth={strokeWidth}
          curvature={curvature}
        />
      )}
    </div>
  );
}

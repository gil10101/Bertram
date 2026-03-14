"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export type AnimationMode = "scroll" | "time";

interface UseAnimationProgressOptions {
  mode?: AnimationMode;
  /** Only used in "time" mode — current frame from Remotion */
  currentFrame?: number;
  /** Only used in "time" mode — total frames for this section */
  durationFrames?: number;
  /** ScrollTrigger start position (default: "top 80%") */
  start?: string;
  /** ScrollTrigger end position (default: "bottom 20%") */
  end?: string;
}

/**
 * Dual-mode animation driver.
 * - scroll mode: GSAP ScrollTrigger maps scroll → 0-1 progress
 * - time mode: currentFrame / durationFrames → 0-1 progress
 */
export function useAnimationProgress(
  triggerRef: React.RefObject<HTMLElement | null>,
  options: UseAnimationProgressOptions = {},
) {
  const {
    mode = "scroll",
    currentFrame = 0,
    durationFrames = 1,
    start = "top 80%",
    end = "bottom 20%",
  } = options;

  const [progress, setProgress] = useState(0);
  const stRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    if (mode === "time") {
      setProgress(Math.min(Math.max(currentFrame / durationFrames, 0), 1));
      return;
    }

    if (!triggerRef.current) return;

    stRef.current = ScrollTrigger.create({
      trigger: triggerRef.current,
      start,
      end,
      onUpdate: (self: { progress: number }) => setProgress(self.progress),
    });

    return () => {
      stRef.current?.kill();
    };
  }, [mode, currentFrame, durationFrames, start, end, triggerRef]);

  return progress;
}

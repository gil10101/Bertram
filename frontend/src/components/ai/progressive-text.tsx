"use client";

import { useState, useEffect, useMemo } from "react";

interface ProgressiveTextProps {
  text: string;
  /** Delay in ms between each word appearing */
  wordDelay?: number;
  /** CSS class for the container */
  className?: string;
  /** Called when the full text has been revealed */
  onComplete?: () => void;
}

export function ProgressiveText({
  text,
  wordDelay = 30,
  className,
  onComplete,
}: ProgressiveTextProps) {
  const words = useMemo(() => text.split(/(\s+)/), [text]);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    setVisibleCount(0);
  }, [text]);

  useEffect(() => {
    if (visibleCount >= words.length) {
      onComplete?.();
      return;
    }

    const timer = setTimeout(() => {
      setVisibleCount((c) => c + 1);
    }, wordDelay);

    return () => clearTimeout(timer);
  }, [visibleCount, words.length, wordDelay, onComplete]);

  return (
    <span className={className}>
      {words.map((word, i) => (
        <span
          key={i}
          className="transition-opacity duration-200 ease-out"
          style={{ opacity: i < visibleCount ? 1 : 0 }}
        >
          {word}
        </span>
      ))}
    </span>
  );
}

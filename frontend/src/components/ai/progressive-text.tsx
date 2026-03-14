"use client";

import { useState, useEffect, useMemo, useRef } from "react";

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
  const words = useMemo(() => text.split(" "), [text]);
  const [visibleCount, setVisibleCount] = useState(0);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    setVisibleCount(0);
  }, [text]);

  useEffect(() => {
    if (visibleCount >= words.length) {
      onCompleteRef.current?.();
      return;
    }

    const timer = setTimeout(() => {
      setVisibleCount((c) => c + 1);
    }, wordDelay);

    return () => clearTimeout(timer);
  }, [visibleCount, words.length, wordDelay]);

  return (
    <span className={className}>
      {words.map((word, i) => (
        <span
          key={i}
          className="transition-opacity duration-150 ease-out"
          style={{ opacity: i < visibleCount ? 1 : 0 }}
        >
          {word}{i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}

"use client";

import { useEffect, useRef } from "react";

const items = [
  "Smart Replies",
  "Scheduling",
  "Prioritization",
  "AI Drafts",
  "Gmail",
  "Outlook",
  "Threads",
  "Analytics",
];

function MarqueeContent() {
  return (
    <span className="flex shrink-0 items-center gap-16">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-16">
          {item}
          <i className="h-1.5 w-1.5 shrink-0 rounded-full bg-paprika not-italic" />
        </span>
      ))}
    </span>
  );
}

export function Marquee() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let pos = 0;
    let rafId: number;
    const firstSpan = track.children[0] as HTMLElement;

    function tick() {
      pos -= 0.5;
      if (firstSpan && pos <= -(firstSpan.offsetWidth + 64)) {
        pos = 0;
      }
      track!.style.transform = `translateX(${pos}px)`;
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <section className="overflow-hidden border-b border-t border-charcoal-400/30 py-8">
      <div
        ref={trackRef}
        className="flex gap-16 whitespace-nowrap text-[clamp(1rem,2vw,1.6rem)] font-light tracking-[-0.01em] text-dust-400 will-change-transform"
      >
        <MarqueeContent />
        <MarqueeContent />
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Inbox Analytics visualization:
 * Sparkline draws itself, radial progress ring fills to 87%,
 * number counts up to "3hrs".
 */
export function AnalyticsVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);
  const [hours, setHours] = useState(0);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    if (!ref.current || hasAnimated.current) return;

    const ctx = gsap.context(() => {
      const proxy = { hours: 0, percent: 0 };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ref.current,
          start: "top 60%",
        },
        onStart: () => {
          hasAnimated.current = true;
        },
      });

      // Draw sparkline
      tl.to("[data-sparkline]", {
        strokeDashoffset: 0,
        duration: 1.5,
        ease: "power2.out",
      });

      // Fill radial progress
      tl.to(
        "[data-progress-ring]",
        {
          strokeDashoffset: (1 - 0.87) * 251.2, // circumference = 2π×40 ≈ 251.2
          duration: 1.5,
          ease: "power2.out",
        },
        "<",
      );

      // Count up hours
      tl.to(
        proxy,
        {
          hours: 3,
          duration: 1.5,
          ease: "power2.out",
          onUpdate: () => setHours(Math.round(proxy.hours)),
        },
        "<",
      );

      // Count up percent
      tl.to(
        proxy,
        {
          percent: 87,
          duration: 1.5,
          ease: "power2.out",
          onUpdate: () => setPercent(Math.round(proxy.percent)),
        },
        "<",
      );

      // Fade in labels
      tl.to("[data-analytics-label]", {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power3.out",
      }, "-=0.5");
    }, ref);

    return () => ctx.revert();
  }, []);

  // Sparkline path
  const sparkPoints = "M0,40 L20,35 L40,38 L60,25 L80,30 L100,18 L120,22 L140,12 L160,15 L180,8 L200,10";
  const sparkLength = 280;

  // Radial ring
  const circumference = 2 * Math.PI * 40; // r=40

  return (
    <div ref={ref} className="flex h-full w-full items-center justify-between gap-4 p-4">
      {/* Left: sparkline + hours */}
      <div className="flex flex-1 flex-col gap-2">
        <svg viewBox="0 0 200 50" className="h-[40px] w-full overflow-visible">
          <path
            data-sparkline=""
            d={sparkPoints}
            fill="none"
            stroke="#eb5e28"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={sparkLength}
            strokeDashoffset={sparkLength}
          />
          <path
            d={`${sparkPoints} L200,50 L0,50Z`}
            fill="url(#sparkFill)"
            opacity="0.15"
          />
          <defs>
            <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#eb5e28" />
              <stop offset="100%" stopColor="#eb5e28" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
        <div
          data-analytics-label=""
          style={{ opacity: 0, transform: "translateY(8px)" }}
        >
          <span className="text-[1.4rem] font-light leading-none tracking-tight text-floral">
            {hours}hrs
          </span>
          <span className="ml-1.5 text-[0.55rem] uppercase tracking-wider text-dust-400/60">
            saved / week
          </span>
        </div>
      </div>

      {/* Right: radial progress */}
      <div className="relative flex shrink-0 flex-col items-center">
        <svg width="90" height="90" viewBox="0 0 90 90" className="rotate-[-90deg]">
          <circle
            cx="45"
            cy="45"
            r="40"
            fill="none"
            stroke="rgba(204,197,185,0.1)"
            strokeWidth="3"
          />
          <circle
            data-progress-ring=""
            cx="45"
            cy="45"
            r="40"
            fill="none"
            stroke="#eb5e28"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[0.9rem] font-light text-floral">{percent}%</span>
        </div>
        <div
          data-analytics-label=""
          className="mt-1 text-[0.5rem] uppercase tracking-wider text-dust-400/60"
          style={{ opacity: 0, transform: "translateY(8px)" }}
        >
          reply accuracy
        </div>
      </div>
    </div>
  );
}

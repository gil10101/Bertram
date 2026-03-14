"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * AI Summaries visualization:
 * Mock email text bars compress into 3 highlighted bullet points.
 * A scanning line sweeps top → bottom.
 */
export function SummaryVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!ref.current || hasAnimated.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ref.current,
          start: "top 60%",
        },
        onStart: () => {
          hasAnimated.current = true;
        },
      });

      // Fade in the email bars
      tl.to("[data-email-bar]", {
        scaleX: 1,
        opacity: 1,
        duration: 0.4,
        stagger: 0.04,
        ease: "power2.out",
      });

      // Scanning line sweeps down
      tl.to(
        "[data-scan-line]",
        {
          top: "100%",
          duration: 1.2,
          ease: "power2.inOut",
        },
        "+=0.3",
      );

      // Fade out email bars, fade in summary bullets
      tl.to("[data-email-bar]", {
        opacity: 0.05,
        duration: 0.4,
        stagger: 0.02,
      });

      tl.to(
        "[data-summary-bullet]",
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          stagger: 0.15,
          ease: "power3.out",
        },
        "-=0.2",
      );
    }, ref);

    return () => ctx.revert();
  }, []);

  const barWidths = [85, 92, 70, 88, 60, 95, 75, 82, 68, 90, 55, 78];

  return (
    <div ref={ref} className="relative h-full w-full overflow-hidden rounded-lg">
      {/* Email text bars */}
      <div className="absolute inset-0 flex flex-col gap-1.5 p-4">
        {barWidths.map((w, i) => (
          <div
            key={i}
            data-email-bar=""
            className="h-2 origin-left rounded-full bg-floral/10"
            style={{
              width: `${w}%`,
              transform: "scaleX(0)",
              opacity: 0,
            }}
          />
        ))}
      </div>

      {/* Scanning line */}
      <div
        data-scan-line=""
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-paprika to-transparent"
        style={{ top: "0%" }}
      />

      {/* Summary bullets */}
      <div className="absolute inset-0 flex flex-col justify-center gap-3 p-4">
        {["Key decision needed by Friday", "Budget approval — $12K", "Team sync moved to 3pm"].map(
          (text, i) => (
            <div
              key={i}
              data-summary-bullet=""
              className="flex items-center gap-2 text-[0.7rem] text-floral"
              style={{ opacity: 0, transform: "translateX(-10px)" }}
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-paprika" />
              {text}
            </div>
          ),
        )}
      </div>
    </div>
  );
}

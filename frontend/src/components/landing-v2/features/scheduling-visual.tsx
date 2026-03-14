"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Meeting Scheduling visualization:
 * 5-col mini calendar grid. Slots fill sequentially with
 * available/busy/conflict states. Optimal slot pulses paprika + checkmark.
 */

type SlotState = "empty" | "available" | "busy" | "conflict" | "optimal";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const times = ["9am", "10am", "11am", "1pm", "2pm", "3pm"];

// Grid layout: rows = times, cols = days
const slotStates: SlotState[][] = [
  ["busy", "available", "available", "conflict", "available"],
  ["available", "busy", "available", "available", "busy"],
  ["available", "available", "busy", "available", "available"],
  ["busy", "available", "available", "busy", "available"],
  ["available", "available", "optimal", "available", "busy"],
  ["available", "busy", "available", "available", "available"],
];

const stateColors: Record<SlotState, string> = {
  empty: "bg-charcoal-400/20",
  available: "bg-floral/8",
  busy: "bg-dust-400/15",
  conflict: "bg-red-500/20",
  optimal: "bg-paprika/30",
};

export function SchedulingVisual() {
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

      // Fill slots sequentially
      tl.to("[data-cal-slot]", {
        opacity: 1,
        scale: 1,
        duration: 0.15,
        stagger: {
          each: 0.04,
          grid: [6, 5],
          from: "start",
        },
        ease: "power2.out",
      });

      // Pulse the optimal slot
      tl.to("[data-optimal]", {
        boxShadow: "0 0 12px rgba(235,94,40,0.4)",
        duration: 0.6,
        repeat: 2,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Show checkmark
      tl.to("[data-check]", {
        opacity: 1,
        scale: 1,
        duration: 0.3,
        ease: "back.out(3)",
      });
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="flex h-full w-full flex-col p-3">
      {/* Day headers */}
      <div className="mb-1 grid grid-cols-5 gap-1 pl-8">
        {days.map((d) => (
          <div key={d} className="text-center text-[0.5rem] uppercase tracking-wider text-dust-400/60">
            {d}
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div className="flex flex-1 flex-col gap-1">
        {times.map((time, row) => (
          <div key={time} className="grid grid-cols-[2rem_1fr] gap-1">
            <div className="flex items-center text-[0.5rem] text-dust-400/50">{time}</div>
            <div className="grid grid-cols-5 gap-1">
              {slotStates[row].map((state, col) => (
                <div
                  key={`${row}-${col}`}
                  data-cal-slot=""
                  {...(state === "optimal" ? { "data-optimal": "" } : {})}
                  className={`relative flex items-center justify-center rounded-sm ${stateColors[state]} h-full min-h-[16px]`}
                  style={{ opacity: 0, transform: "scale(0.5)" }}
                >
                  {state === "optimal" && (
                    <span
                      data-check=""
                      className="text-[0.55rem] text-paprika"
                      style={{ opacity: 0, transform: "scale(0)" }}
                    >
                      &#10003;
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Smart Priority visualization:
 * Email rows appear, then get reordered by priority.
 * Urgency badges fade in with color coding.
 */

const emails = [
  { label: "Team standup notes", priority: "Low", color: "bg-dust-400/40", textColor: "text-dust-400" },
  { label: "Invoice overdue — action needed", priority: "Urgent", color: "bg-paprika/40", textColor: "text-paprika" },
  { label: "Q2 planning doc shared", priority: "Medium", color: "bg-amber-500/30", textColor: "text-amber-400" },
  { label: "Server alert: CPU at 94%", priority: "Urgent", color: "bg-paprika/40", textColor: "text-paprika" },
  { label: "Newsletter — March edition", priority: "Low", color: "bg-dust-400/40", textColor: "text-dust-400" },
];

// After sorting: Urgent (1,3), Medium (2), Low (0,4)
const sortedOrder = [1, 3, 2, 0, 4];

export function PriorityVisual() {
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

      // Fade in all rows
      tl.to("[data-priority-row]", {
        opacity: 1,
        x: 0,
        duration: 0.4,
        stagger: 0.06,
        ease: "power2.out",
      });

      // Pause, then shuffle: move rows to their sorted positions
      const rowHeight = 30; // approximate row height + gap
      sortedOrder.forEach((originalIdx, newIdx) => {
        const yOffset = (newIdx - originalIdx) * rowHeight;
        tl.to(
          `[data-priority-row="${originalIdx}"]`,
          {
            y: yOffset,
            duration: 0.6,
            ease: "power3.inOut",
          },
          "shuffle"
        );
      });

      // Show priority badges
      tl.to(
        "[data-priority-badge]",
        {
          opacity: 1,
          scale: 1,
          duration: 0.3,
          stagger: 0.08,
          ease: "back.out(2)",
        },
        "+=0.1"
      );
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="relative flex h-full w-full flex-col justify-center gap-1.5 p-4">
      {emails.map((email, i) => (
        <div
          key={i}
          data-priority-row={i}
          className="flex items-center justify-between rounded-md bg-charcoal-400/10 px-3 py-1.5"
          style={{ opacity: 0, transform: "translateX(-12px)" }}
        >
          <span className="truncate text-[0.6rem] text-floral/70">{email.label}</span>
          <span
            data-priority-badge=""
            className={`shrink-0 rounded-full px-1.5 py-0.5 text-[0.45rem] font-medium uppercase tracking-wider ${email.color} ${email.textColor}`}
            style={{ opacity: 0, transform: "scale(0.6)" }}
          >
            {email.priority}
          </span>
        </div>
      ))}
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Unified Inbox visualization:
 * Multiple account icons converge into a single clean inbox list.
 */

const accounts = [
  { label: "Gmail", color: "#eb5e28" },
  { label: "Outlook", color: "#f59e0b" },
  { label: "Work", color: "#6a655e" },
];

const unifiedEmails = [
  { from: "Sarah K.", subject: "Updated designs attached", dot: "#eb5e28" },
  { from: "Jira", subject: "BERT-142 moved to review", dot: "#f59e0b" },
  { from: "Alex M.", subject: "Quick sync tomorrow?", dot: "#6a655e" },
  { from: "Stripe", subject: "Payment received — $2,400", dot: "#eb5e28" },
];

export function UnifiedInboxVisual() {
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

      // Account icons spread out
      tl.to("[data-account-icon]", {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        stagger: 0.12,
        ease: "back.out(2)",
      });

      // Account icons converge to center and fade
      tl.to("[data-account-icon]", {
        x: 0,
        opacity: 0,
        scale: 0.5,
        duration: 0.5,
        ease: "power3.in",
      }, "+=0.5");

      // Hide accounts row, show unified list
      tl.to("[data-accounts-row]", { height: 0, opacity: 0, duration: 0.3 }, "-=0.2");

      // Unified email rows appear
      tl.to("[data-unified-row]", {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.08,
        ease: "power3.out",
      });
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="relative flex h-full w-full flex-col p-4">
      {/* Account icons row */}
      <div data-accounts-row="" className="mb-3 flex items-center justify-center gap-4 overflow-hidden py-2">
        {accounts.map((acc, i) => (
          <div
            key={i}
            data-account-icon=""
            className="flex flex-col items-center gap-1"
            style={{
              opacity: 0,
              transform: `scale(0.5) translateX(${(i - 1) * 30}px)`,
            }}
          >
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full"
              style={{ backgroundColor: acc.color + "25", border: `1px solid ${acc.color}40` }}
            >
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: acc.color }} />
            </div>
            <span className="text-[0.45rem] text-dust-400/60">{acc.label}</span>
          </div>
        ))}
      </div>

      {/* Unified email list */}
      <div className="flex flex-1 flex-col gap-1">
        {unifiedEmails.map((email, i) => (
          <div
            key={i}
            data-unified-row=""
            className="flex items-center gap-2.5 rounded-md bg-charcoal-400/10 px-3 py-1.5"
            style={{ opacity: 0, transform: "translateY(8px)" }}
          >
            <div className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: email.dot }} />
            <span className="shrink-0 text-[0.6rem] font-medium text-floral/80">{email.from}</span>
            <span className="truncate text-[0.55rem] text-dust-400/70">{email.subject}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

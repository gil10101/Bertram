"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatedBeam } from "./animated-beam";
import { BertramLogo } from "@/components/common/bertram-logo";

const beamPaths = [
  // Gmail → Bertram
  {
    id: "gmail-bertram",
    from: "gmail",
    to: "bertram",
    delay: 0,
    duration: 5,
    gradient: ["#eb5e28", "#9333ea"] as [string, string],
  },
  // Outlook → Bertram
  {
    id: "outlook-bertram",
    from: "outlook",
    to: "bertram",
    delay: 1.5,
    duration: 6,
    gradient: ["#f59e0b", "#9333ea"] as [string, string],
  },
  // Bertram → Prioritized
  {
    id: "bertram-priority",
    from: "bertram",
    to: "priority",
    delay: 2,
    duration: 5,
    gradient: ["#9333ea", "#eb5e28"] as [string, string],
  },
  // Bertram → Replies
  {
    id: "bertram-replies",
    from: "bertram",
    to: "replies",
    delay: 3.5,
    duration: 7,
    gradient: ["#9333ea", "#f59e0b"] as [string, string],
  },
  // Bertram → Meetings
  {
    id: "bertram-meetings",
    from: "bertram",
    to: "meetings",
    delay: 4.5,
    duration: 6,
    gradient: ["#9333ea", "#eb5e28"] as [string, string],
  },
];

const steps = [
  {
    number: "01",
    title: "Connect",
    desc: "Link your Gmail and Outlook accounts in one click. Bertram syncs in real-time.",
  },
  {
    number: "02",
    title: "Process",
    desc: "AI reads, classifies, and prioritizes every message \u2014 instantly.",
  },
  {
    number: "03",
    title: "Deliver",
    desc: "Smart replies, scheduled meetings, and a clean inbox \u2014 on autopilot.",
  },
];

function GmailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="M22 6L12 13 2 6V4l10 7 10-7v2z" fill="#eb5e28" opacity="0.8" />
      <rect x="2" y="4" width="20" height="16" rx="2" stroke="#eb5e28" strokeWidth="1.5" fill="none" opacity="0.4" />
    </svg>
  );
}

function OutlookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="#f59e0b" strokeWidth="1.5" fill="none" opacity="0.4" />
      <path d="M3 7l9 6 9-6" stroke="#f59e0b" strokeWidth="1.5" opacity="0.8" />
    </svg>
  );
}

export function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section id="how-it-works" className="relative overflow-hidden px-6 py-32 md:px-12 md:py-48">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-20 text-[0.75rem] uppercase tracking-[0.15em] text-dust-400">
          How it works
        </div>

        {/* Beam diagram */}
        <div
          ref={containerRef}
          className="relative mx-auto mb-24 flex max-w-[700px] items-center justify-between rounded-2xl border border-charcoal-400/10 bg-carbon/40 px-10 py-14 backdrop-blur-sm md:px-16"
        >
          {/* Subtle atmospheric glow */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-paprika/[0.03] via-transparent to-charcoal/[0.05]" />

          {/* Left: Email providers */}
          <div className="relative flex flex-col gap-8">
            <div className="mb-1 text-center text-[0.55rem] uppercase tracking-[0.15em] text-dust-400/60">
              Sources
            </div>
            <div
              data-beam="gmail"
              className="flex h-14 w-14 items-center justify-center rounded-xl border border-charcoal-400/20 bg-charcoal-400/10 transition-colors duration-300 hover:border-paprika/20"
            >
              <GmailIcon />
            </div>
            <div
              data-beam="outlook"
              className="flex h-14 w-14 items-center justify-center rounded-xl border border-charcoal-400/20 bg-charcoal-400/10 transition-colors duration-300 hover:border-paprika/20"
            >
              <OutlookIcon />
            </div>
          </div>

          {/* Center: Bertram */}
          <div
            data-beam="bertram"
            className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-paprika/30 bg-paprika/10 backdrop-blur-sm"
          >
            <div className="absolute inset-0 rounded-2xl bg-paprika/5 shadow-[0_0_40px_rgba(235,94,40,0.15)]" />
            <BertramLogo size={36} className="relative" />
          </div>

          {/* Right: Outputs */}
          <div className="relative flex flex-col gap-5">
            <div className="mb-1 text-center text-[0.55rem] uppercase tracking-[0.15em] text-dust-400/60">
              Outputs
            </div>
            <div
              data-beam="priority"
              className="flex h-11 items-center gap-2.5 rounded-lg border border-charcoal-400/20 bg-charcoal-400/10 px-4 transition-colors duration-300 hover:border-paprika/20"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-paprika/60" />
              <span className="text-[0.65rem] tracking-[0.02em] text-dust-400">Prioritized Inbox</span>
            </div>
            <div
              data-beam="replies"
              className="flex h-11 items-center gap-2.5 rounded-lg border border-charcoal-400/20 bg-charcoal-400/10 px-4 transition-colors duration-300 hover:border-paprika/20"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-paprika/60" />
              <span className="text-[0.65rem] tracking-[0.02em] text-dust-400">Smart Replies</span>
            </div>
            <div
              data-beam="meetings"
              className="flex h-11 items-center gap-2.5 rounded-lg border border-charcoal-400/20 bg-charcoal-400/10 px-4 transition-colors duration-300 hover:border-paprika/20"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-paprika/60" />
              <span className="text-[0.65rem] tracking-[0.02em] text-dust-400">Scheduled Meetings</span>
            </div>
          </div>

          {/* Beams layer */}
          {mounted && containerRef.current && (
            <AnimatedBeam
              containerRef={containerRef}
              paths={beamPaths}
              opacity={0.5}
              strokeWidth={2}
              curvature={30}
            />
          )}
        </div>

        {/* Step descriptions */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
          {steps.map((step) => (
            <div key={step.number} className="border-l border-charcoal-400/30 pl-6">
              <div className="mb-3 text-[0.65rem] uppercase tracking-[0.15em] text-paprika">
                {step.number}
              </div>
              <h3 className="mb-2 text-[1.2rem] font-light tracking-[-0.02em] text-floral">
                {step.title}
              </h3>
              <p className="text-[0.8rem] leading-[1.7] text-dust-400">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

function PriorityBars() {
  const heights = [40, 65, 50, 90, 35, 70, 55, 80, 45, 95, 60, 30];
  const darkIndices = new Set([3, 9]);

  return (
    <div className="flex items-end gap-1 h-full">
      {heights.map((h, i) => (
        <div
          key={i}
          data-feature-bar=""
          className={
            darkIndices.has(i)
              ? "flex-1 rounded-t-sm bg-carbon opacity-90"
              : `flex-1 rounded-t-sm bg-paprika ${i % 2 === 0 ? "opacity-[0.15]" : "opacity-25"}`
          }
          style={{
            height: `${h}%`,
            transformOrigin: "bottom",
            transform: "scaleY(0)",
          }}
        />
      ))}
    </div>
  );
}

function ResponseGraph() {
  return (
    <svg className="w-full h-full" viewBox="0 0 400 180" fill="none">
      <path
        data-savings-line=""
        d="M0,150 C50,140 80,130 120,100 C160,70 200,90 240,60 C280,30 320,45 360,20 L400,10"
        stroke="#eb5e28"
        strokeWidth="2"
        fill="none"
        strokeDasharray="600"
        strokeDashoffset="600"
      />
      <path
        d="M0,150 C50,140 80,130 120,100 C160,70 200,90 240,60 C280,30 320,45 360,20 L400,10 L400,180 L0,180Z"
        fill="url(#savingsGrad)"
        opacity="0.15"
      />
      <defs>
        <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#eb5e28" />
          <stop offset="100%" stopColor="#eb5e28" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function ScheduleCircle() {
  return (
    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
      <div className="w-[80px] h-[80px] sm:w-[120px] sm:h-[120px] border border-dust/60 rounded-full relative shrink-0">
        <div className="absolute inset-[15%] bg-paprika rounded-full opacity-20" />
      </div>
      <div className="text-[0.8rem] text-charcoal-300 leading-8">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-paprika inline-block" />{" "}
          Auto-scheduled 64%
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-charcoal opacity-35 inline-block" />{" "}
          Rescheduled 22%
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-dust inline-block" />{" "}
          Manual 14%
        </div>
      </div>
    </div>
  );
}

function InboxStats() {
  return (
    <div className="flex gap-6 sm:gap-8 items-end">
      <div>
        <div className="text-[2.5rem] font-light tracking-[-0.03em] leading-none">
          3hrs
        </div>
        <div className="text-[0.7rem] text-charcoal-300 mt-2 uppercase tracking-[0.1em]">
          saved / week
        </div>
      </div>
      <div>
        <div className="text-[2.5rem] font-light tracking-[-0.03em] leading-none text-paprika">
          ↗ 87%
        </div>
        <div className="text-[0.7rem] text-charcoal-300 mt-2 uppercase tracking-[0.1em]">
          reply accuracy
        </div>
      </div>
    </div>
  );
}

const features = [
  {
    number: "01",
    title: "AI\nPrioritization",
    desc: "Bertram reads and ranks every email by urgency and context. Important threads surface first — noise fades away.",
    visual: <PriorityBars />,
  },
  {
    number: "02",
    title: "Smart\nReplies",
    desc: "One-click AI drafts that match your tone and style. Review, edit, send — or let Bertram handle it entirely.",
    visual: <ResponseGraph />,
  },
  {
    number: "03",
    title: "Meeting\nScheduling",
    desc: "Bertram detects scheduling requests, checks your calendar, and proposes times — no back-and-forth required.",
    visual: <ScheduleCircle />,
  },
  {
    number: "04",
    title: "Inbox\nAnalytics",
    desc: "Weekly digests showing response times, email volume, and time saved. See exactly how Bertram is working for you.",
    visual: <InboxStats />,
  },
];

export function Features() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const section = sectionRef.current;
    if (!track || !section) return;

    const ctx = gsap.context(() => {
      const totalScroll = track.scrollWidth - window.innerWidth;

      gsap.to(track, {
        x: () => -totalScroll,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${totalScroll}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      });

      gsap.to("[data-feature-bar]", {
        scaleY: 1,
        duration: 0.8,
        stagger: 0.05,
        ease: "power3.out",
        scrollTrigger: { trigger: section, start: "top 60%" },
      });

      gsap.to("[data-savings-line]", {
        strokeDashoffset: 0,
        duration: 2,
        ease: "power2.out",
        scrollTrigger: { trigger: section, start: "top 40%" },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="features" className="py-32">
      <div className="px-6 md:px-12 mb-20 flex justify-between items-end">
        <span className="text-[0.75rem] uppercase tracking-[0.15em] text-charcoal-300">
          What we do
        </span>
        <span className="text-[0.75rem] text-charcoal-300 tracking-[0.05em]">
          01 — 04
        </span>
      </div>

      <div ref={trackRef} className="flex px-6 md:px-12">
        {features.map((f) => (
          <div
            key={f.number}
            className="flex-none w-[85vw] min-w-[300px] md:w-[50vw] md:min-w-[400px] px-8 border-l border-dust/50"
          >
            <div className="text-[0.7rem] text-charcoal-300 tracking-[0.15em] uppercase mb-8">
              {f.number}
            </div>
            <h3 className="text-[clamp(1.5rem,3vw,2.5rem)] font-light tracking-[-0.03em] mb-6 leading-[1.1] whitespace-pre-line">
              {f.title}
            </h3>
            <p className="text-[0.9rem] text-charcoal-300 leading-[1.7] max-w-[24rem]">
              {f.desc}
            </p>
            <div className="mt-12 h-[180px] relative overflow-hidden">
              {f.visual}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

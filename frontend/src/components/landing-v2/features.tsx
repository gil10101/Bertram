"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

function PriorityBars() {
  const heights = [40, 65, 50, 90, 35, 70, 55, 80, 45, 95, 60, 30];
  const accentIndices = new Set([3, 9]);

  return (
    <div className="flex h-full items-end gap-1">
      {heights.map((h, i) => (
        <div
          key={i}
          data-feature-bar=""
          className={
            accentIndices.has(i)
              ? "flex-1 rounded-t-sm bg-paprika opacity-90"
              : `flex-1 rounded-t-sm bg-floral ${i % 2 === 0 ? "opacity-[0.08]" : "opacity-[0.15]"}`
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
    <svg className="h-full w-full" viewBox="0 0 400 180" fill="none">
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
        fill="url(#savingsGradV2)"
        opacity="0.2"
      />
      <defs>
        <linearGradient id="savingsGradV2" x1="0" y1="0" x2="0" y2="1">
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
      <div className="relative h-[80px] w-[80px] shrink-0 rounded-full border border-charcoal-400/40 sm:h-[120px] sm:w-[120px]">
        <div className="absolute inset-[15%] rounded-full bg-paprika opacity-25" />
      </div>
      <div className="text-[0.8rem] leading-8 text-dust-400">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-paprika" />{" "}
          Auto-scheduled 64%
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-charcoal-200 opacity-50" />{" "}
          Rescheduled 22%
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-dust-400" />{" "}
          Manual 14%
        </div>
      </div>
    </div>
  );
}

function InboxStats() {
  return (
    <div className="flex items-end gap-6 sm:gap-8">
      <div>
        <div className="text-[2.5rem] font-light leading-none tracking-[-0.03em] text-floral">
          3hrs
        </div>
        <div className="mt-2 text-[0.7rem] uppercase tracking-[0.1em] text-dust-400">
          saved / week
        </div>
      </div>
      <div>
        <div className="text-[2.5rem] font-light leading-none tracking-[-0.03em] text-paprika">
          &#8599; 87%
        </div>
        <div className="mt-2 text-[0.7rem] uppercase tracking-[0.1em] text-dust-400">
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
    desc: "Bertram reads and ranks every email by urgency and context. Important threads surface first \u2014 noise fades away.",
    visual: <PriorityBars />,
  },
  {
    number: "02",
    title: "Smart\nReplies",
    desc: "One-click AI drafts that match your tone and style. Review, edit, send \u2014 or let Bertram handle it entirely.",
    visual: <ResponseGraph />,
  },
  {
    number: "03",
    title: "Meeting\nScheduling",
    desc: "Bertram detects scheduling requests, checks your calendar, and proposes times \u2014 no back-and-forth required.",
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
      <div className="mb-20 flex items-end justify-between px-6 md:px-12">
        <span className="text-[0.75rem] uppercase tracking-[0.15em] text-dust-400">
          What we do
        </span>
        <span className="text-[0.75rem] tracking-[0.05em] text-dust-400">
          01 &#8212; 04
        </span>
      </div>

      <div ref={trackRef} className="flex px-6 md:px-12">
        {features.map((f) => (
          <div
            key={f.number}
            className="min-w-[300px] flex-none border-l border-charcoal-400/30 px-8 md:min-w-[400px] md:w-[50vw]"
            style={{ width: "85vw" }}
          >
            <div className="mb-8 text-[0.7rem] uppercase tracking-[0.15em] text-dust-400">
              {f.number}
            </div>
            <h3 className="mb-6 whitespace-pre-line text-[clamp(1.5rem,3vw,2.5rem)] font-light leading-[1.1] tracking-[-0.03em] text-floral">
              {f.title}
            </h3>
            <p className="max-w-[24rem] text-[0.9rem] leading-[1.7] text-dust-400">
              {f.desc}
            </p>
            <div className="relative mt-12 h-[180px] overflow-hidden">
              {f.visual}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { SummaryVisual } from "./features/summary-visual";
import { SmartReplyVisual } from "./features/smart-reply-visual";
import { SchedulingVisual } from "./features/scheduling-visual";
import { PriorityVisual } from "./features/priority-visual";
import { UnifiedInboxVisual } from "./features/unified-inbox-visual";

const features = [
  {
    number: "01",
    title: "AI-Powered\nSummaries",
    desc: "Bertram distills every email into key takeaways. Long threads become three bullet points \u2014 so you read less and decide faster.",
    visual: <SummaryVisual />,
  },
  {
    number: "02",
    title: "Smart\nReplies",
    desc: "One-click AI drafts that match your tone and style. Review, edit, send \u2014 or let Bertram handle it entirely.",
    visual: <SmartReplyVisual />,
  },
  {
    number: "03",
    title: "Meeting\nScheduling",
    desc: "Bertram detects scheduling requests, checks your calendar, and proposes times \u2014 no back-and-forth required.",
    visual: <SchedulingVisual />,
  },
  {
    number: "04",
    title: "Smart\nPriority",
    desc: "Every email gets ranked by urgency automatically. Urgent items surface to the top \u2014 newsletters and noise sink to the bottom.",
    visual: <PriorityVisual />,
  },
  {
    number: "05",
    title: "Unified\nInbox",
    desc: "Gmail, Outlook, and work accounts in one view. No more switching tabs \u2014 every message, one place.",
    visual: <UnifiedInboxVisual />,
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
          01 &#8212; 05
        </span>
      </div>

      <div ref={trackRef} className="flex px-6 md:px-12">
        {features.map((f) => (
          <div
            key={f.number}
            className="min-w-[260px] flex-none border-l border-charcoal-400/30 px-8 md:min-w-[300px] md:w-[28vw]"
            style={{ width: "30vw" }}
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
            <div className="relative mt-12 h-[180px] overflow-hidden rounded-lg border border-charcoal-400/20 bg-charcoal-400/5">
              {f.visual}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}


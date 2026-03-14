"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Smart Replies visualization:
 * Chat bubble interface — incoming message slides in, typing dots animate,
 * reply types out character-by-character, tone badges appear.
 */
export function SmartReplyVisual() {
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

      // Incoming message slides in
      tl.to("[data-incoming-msg]", {
        opacity: 1,
        x: 0,
        duration: 0.5,
        ease: "power3.out",
      });

      // Typing dots appear and pulse
      tl.to(
        "[data-typing]",
        {
          opacity: 1,
          duration: 0.3,
        },
        "+=0.4",
      );

      // Typing dots bounce
      tl.to("[data-dot]", {
        y: -3,
        duration: 0.3,
        stagger: { each: 0.15, repeat: 2, yoyo: true },
        ease: "power2.inOut",
      });

      // Hide typing, show reply
      tl.to("[data-typing]", { opacity: 0, duration: 0.2 });
      tl.to("[data-reply-msg]", {
        opacity: 1,
        x: 0,
        duration: 0.5,
        ease: "power3.out",
      });

      // Type out text effect via clip-path
      tl.to("[data-reply-text]", {
        clipPath: "inset(0 0% 0 0)",
        duration: 1.2,
        ease: "steps(20)",
      });

      // Tone badges appear
      tl.to("[data-tone-badge]", {
        opacity: 1,
        scale: 1,
        duration: 0.3,
        stagger: 0.1,
        ease: "back.out(2)",
      });
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="relative flex h-full w-full flex-col justify-center gap-3 p-4">
      {/* Incoming message */}
      <div
        data-incoming-msg=""
        className="max-w-[80%] self-start rounded-xl rounded-bl-sm bg-charcoal-400/50 px-3 py-2 text-[0.65rem] leading-relaxed text-dust-400"
        style={{ opacity: 0, transform: "translateX(-20px)" }}
      >
        Can we reschedule the Q2 review to next week? I have a conflict on Thursday.
      </div>

      {/* Typing indicator */}
      <div
        data-typing=""
        className="flex items-center gap-1 self-end px-3"
        style={{ opacity: 0 }}
      >
        <span data-dot="" className="h-1 w-1 rounded-full bg-dust-400/50" />
        <span data-dot="" className="h-1 w-1 rounded-full bg-dust-400/50" />
        <span data-dot="" className="h-1 w-1 rounded-full bg-dust-400/50" />
      </div>

      {/* Reply message */}
      <div
        data-reply-msg=""
        className="max-w-[80%] self-end rounded-xl rounded-br-sm border border-paprika/20 bg-paprika/5 px-3 py-2"
        style={{ opacity: 0, transform: "translateX(20px)" }}
      >
        <span
          data-reply-text=""
          className="block text-[0.65rem] leading-relaxed text-floral/90"
          style={{ clipPath: "inset(0 100% 0 0)" }}
        >
          Of course! How about Tuesday at 2pm? I&apos;ve checked your calendar and that slot works.
        </span>
      </div>

      {/* Tone badges */}
      <div className="flex justify-end gap-1.5">
        {["Professional", "Friendly", "Concise"].map((tone) => (
          <span
            key={tone}
            data-tone-badge=""
            className="rounded-full border border-charcoal-400/30 px-2 py-0.5 text-[0.55rem] text-dust-400"
            style={{ opacity: 0, transform: "scale(0.8)" }}
          >
            {tone}
          </span>
        ))}
      </div>
    </div>
  );
}

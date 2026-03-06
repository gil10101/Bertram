"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const quoteText =
  "I used to spend two hours a day just triaging email. Bertram cut that to fifteen minutes. The AI replies are scarily good — my team can't even tell which ones I wrote and which ones Bertram drafted for me.";

export function Testimonial() {
  const sectionRef = useRef<HTMLElement>(null);
  const quoteRef = useRef<HTMLQuoteElement>(null);
  const authorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const words = quoteRef.current?.querySelectorAll("[data-quote-word]");
    if (!words) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 85%",
        end: "bottom 40%",
        onUpdate: (self: { progress: number }) => {
          const progress = self.progress;
          words.forEach((w: Element, i: number) => {
            const threshold = (i / words.length) * 0.9;
            (w as HTMLElement).style.opacity =
              progress > threshold ? "1" : "0.1";
          });
        },
      });

      gsap.to(authorRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        scrollTrigger: { trigger: authorRef.current, start: "top 85%" },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const words = quoteText.split(" ");

  return (
    <section
      ref={sectionRef}
      id="testimonial"
      className="py-32 px-6 md:py-48 md:px-12 max-w-[1400px] mx-auto relative"
    >
      <div className="text-[0.75rem] uppercase tracking-[0.15em] text-charcoal-300 mb-16">
        What people say
      </div>
      <blockquote
        ref={quoteRef}
        className="font-serif text-[clamp(1.5rem,4.5vw,4rem)] leading-[1.2] tracking-[-0.02em] max-w-[50rem] italic"
      >
        {words.map((word, i) => (
          <span
            key={i}
            data-quote-word=""
            className="inline-block transition-opacity duration-[400ms] ease-out mr-[0.25em]"
            style={{ opacity: 0.1 }}
          >
            {word}
          </span>
        ))}
      </blockquote>
      <div
        ref={authorRef}
        className="mt-12 flex items-center gap-4"
        style={{ opacity: 0, transform: "translateY(20px)" }}
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-paprika to-charcoal" />
        <div>
          <div className="text-[0.9rem] font-medium">Sarah Chen</div>
          <div className="text-[0.8rem] text-charcoal-300 mt-0.5">
            Engineering Manager, Linear
          </div>
        </div>
      </div>
    </section>
  );
}

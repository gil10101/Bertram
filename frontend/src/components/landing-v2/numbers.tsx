"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

const stats = [
  { value: "2M+", label: "Emails processed daily" },
  { value: "50K", label: "Active users worldwide" },
  { value: "3hrs", label: "Average time saved per week" },
  { value: "4.9", label: "App store rating \u2014 8K reviews" },
];

export function Numbers() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils
        .toArray<HTMLElement>("[data-number-item]")
        .forEach((item, i) => {
          const tl = gsap.timeline({
            scrollTrigger: { trigger: item, start: "top 80%" },
          });
          tl.to(item.querySelector("[data-number-value]")!, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            delay: i * 0.1,
          }).to(
            item.querySelector("[data-number-label]")!,
            { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
            "-=0.4",
          );
        });
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={ref}
      id="numbers"
      className="relative overflow-hidden border-b border-t border-charcoal-400/20 px-6 py-32 md:px-12 md:py-48"
    >
      <div className="absolute -right-[10%] -top-[20%] h-[500px] w-[500px] rounded-full bg-paprika opacity-[0.06] blur-[100px]" />
      <div className="absolute -bottom-[15%] left-[5%] h-[350px] w-[350px] rounded-full bg-dust opacity-[0.05] blur-[100px]" />

      <div className="mx-auto grid max-w-[1400px] grid-cols-1 md:grid-cols-2">
        {stats.map((s, i) => (
          <div
            key={i}
            data-number-item=""
            className={`relative overflow-hidden px-6 py-10 md:px-8 md:py-16 ${
              i < 2 ? "border-b border-charcoal-400/20" : ""
            } ${i % 2 === 0 ? "md:border-r md:border-r-charcoal-400/20" : ""}`}
          >
            <div
              data-number-value=""
              className="text-[clamp(3rem,8vw,7rem)] font-light leading-none tracking-[-0.04em] text-floral"
              style={{ transform: "translateY(60px)", opacity: 0 }}
            >
              {s.value}
            </div>
            <div
              data-number-label=""
              className="mt-4 text-[0.8rem] uppercase tracking-[0.05em] text-dust-500"
              style={{ transform: "translateY(30px)", opacity: 0 }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

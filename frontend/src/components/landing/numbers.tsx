"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

const stats = [
  { value: "2M+", label: "Emails processed daily" },
  { value: "50K", label: "Active users worldwide" },
  { value: "3hrs", label: "Average time saved per week" },
  { value: "4.9", label: "App store rating — 8K reviews" },
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
      className="bg-carbon text-floral py-32 px-6 md:py-48 md:px-12 relative overflow-hidden"
    >
      <div className="absolute w-[500px] h-[500px] rounded-full blur-[80px] opacity-[0.08] bg-paprika -top-[20%] -right-[10%]" />
      <div className="absolute w-[350px] h-[350px] rounded-full blur-[80px] opacity-[0.08] bg-dust -bottom-[15%] left-[5%]" />

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2">
        {stats.map((s, i) => (
          <div
            key={i}
            data-number-item=""
            className={`py-10 px-6 md:py-16 md:px-8 border-b border-floral/[0.1] relative overflow-hidden ${
              i % 2 === 0 ? "md:border-r md:border-r-floral/[0.1]" : ""
            }`}
          >
            <div
              data-number-value=""
              className="text-[clamp(3rem,8vw,7rem)] font-light tracking-[-0.04em] leading-none"
              style={{ transform: "translateY(60px)", opacity: 0 }}
            >
              {s.value}
            </div>
            <div
              data-number-label=""
              className="text-[0.8rem] text-floral/40 mt-4 tracking-[0.05em] uppercase"
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

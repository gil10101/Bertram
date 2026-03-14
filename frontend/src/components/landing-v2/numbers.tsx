"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { numberStats } from "@/lib/animation";

function StatItem({
  stat,
  index,
}: {
  stat: (typeof numberStats)[number];
  index: number;
}) {
  const itemRef = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState("0");
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!itemRef.current || hasAnimated.current) return;

    const ctx = gsap.context(() => {
      const proxy = { value: 0 };

      const tl = gsap.timeline({
        scrollTrigger: { trigger: itemRef.current, start: "top 80%" },
        onStart: () => {
          hasAnimated.current = true;
        },
      });

      // Slide in
      tl.to(itemRef.current!.querySelector("[data-number-value]")!, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
        delay: index * 0.1,
      });

      // Count up
      tl.to(
        proxy,
        {
          value: stat.target,
          duration: 2,
          ease: "power2.out",
          onUpdate: () => setDisplay(stat.format(proxy.value)),
        },
        "<",
      );

      // Label fade in
      tl.to(
        itemRef.current!.querySelector("[data-number-label]")!,
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
        "-=1.2",
      );
    }, itemRef);

    return () => ctx.revert();
  }, [stat, index]);

  return (
    <div
      ref={itemRef}
      data-number-item=""
      className={`relative overflow-hidden px-6 py-10 md:px-8 md:py-16 ${
        index < 2 ? "border-b border-charcoal-400/20" : ""
      } ${index % 2 === 0 ? "md:border-r md:border-r-charcoal-400/20" : ""}`}
    >
      <div
        data-number-value=""
        className="text-[clamp(3rem,8vw,7rem)] font-light leading-none tracking-[-0.04em] text-floral"
        style={{ transform: "translateY(60px)", opacity: 0 }}
      >
        {display}
      </div>
      <div
        data-number-label=""
        className="mt-4 text-[0.8rem] uppercase tracking-[0.05em] text-dust-500"
        style={{ transform: "translateY(30px)", opacity: 0 }}
      >
        {stat.label}
      </div>
    </div>
  );
}

export function Numbers() {
  return (
    <section
      id="numbers"
      className="relative overflow-hidden border-b border-t border-charcoal-400/20 px-6 py-32 md:px-12 md:py-48"
    >
      <div className="absolute -right-[10%] -top-[20%] h-[500px] w-[500px] rounded-full bg-paprika opacity-[0.06] blur-[100px]" />
      <div className="absolute -bottom-[15%] left-[5%] h-[350px] w-[350px] rounded-full bg-dust opacity-[0.05] blur-[100px]" />

      <div className="mx-auto grid max-w-[1400px] grid-cols-1 md:grid-cols-2">
        {numberStats.map((stat, i) => (
          <StatItem key={i} stat={stat} index={i} />
        ))}
      </div>
    </section>
  );
}

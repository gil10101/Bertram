"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "@/lib/gsap";

export function Hero() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.to("[data-hero-line]", {
        y: 0,
        duration: 1.2,
        stagger: 0.12,
        delay: 0.3,
      })
        .to("[data-hero-sub]", { y: 0, duration: 0.9 }, "-=0.5")
        .to("[data-hero-cta]", { y: 0, duration: 0.9 }, "-=0.6");

      gsap.to("[data-orb='1']", {
        y: -120,
        scrollTrigger: { trigger: ref.current, scrub: 1.5 },
      });
      gsap.to("[data-orb='2']", {
        y: -80,
        scrollTrigger: { trigger: ref.current, scrub: 1.5 },
      });
      gsap.to("[data-orb='3']", {
        x: 60,
        scrollTrigger: { trigger: ref.current, scrub: 1.5 },
      });
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={ref}
      className="h-screen flex flex-col justify-center items-center relative overflow-hidden"
    >
      <div
        data-orb="1"
        className="absolute w-[300px] h-[300px] md:w-[600px] md:h-[600px] rounded-full blur-[80px] opacity-[0.15] bg-paprika -top-[15%] -right-[10%]"
      />
      <div
        data-orb="2"
        className="absolute w-[200px] h-[200px] md:w-[400px] md:h-[400px] rounded-full blur-[80px] opacity-[0.15] bg-charcoal -bottom-[10%] -left-[5%]"
      />
      <div
        data-orb="3"
        className="absolute w-[150px] h-[150px] md:w-[250px] md:h-[250px] rounded-full blur-[80px] opacity-[0.08] bg-dust top-[30%] left-[15%]"
      />

      <h1 className="text-[clamp(3.5rem,12vw,11rem)] font-light tracking-[-0.04em] leading-[0.9] text-center relative z-[2]">
        <span className="block overflow-hidden">
          <span
            data-hero-line
            className="block"
            style={{ transform: "translateY(110%)" }}
          >
            Your inbox,
          </span>
        </span>
        <span className="block overflow-hidden pb-[0.15em]">
          <span
            data-hero-line
            className="block"
            style={{ transform: "translateY(110%)" }}
          >
            <em className="font-serif italic">finally</em> clear.
          </span>
        </span>
      </h1>

      <p className="text-[clamp(0.85rem,1.2vw,1rem)] text-charcoal-300 mt-8 md:mt-10 tracking-[0.02em] text-center max-w-[28rem] px-6 leading-[1.7] overflow-hidden">
        <span
          data-hero-sub
          className="block"
          style={{ transform: "translateY(100%)" }}
        >
          AI-powered email. Smart replies. Scheduled meetings.
          <br />
          One beautifully simple interface.
        </span>
      </p>

      <div className="mt-10 md:mt-12 overflow-hidden">
        <Link
          href="/sign-up"
          data-hero-cta
          className="flex items-center gap-3 text-[0.8rem] uppercase tracking-[0.1em] font-medium"
          style={{ transform: "translateY(100%)" }}
        >
          <span className="w-12 h-px bg-carbon" />
          <span>Start for free</span>
        </Link>
      </div>
    </section>
  );
}

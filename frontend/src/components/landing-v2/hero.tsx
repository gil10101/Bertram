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
        .to("[data-hero-cta]", { y: 0, opacity: 1, duration: 0.9 }, "-=0.6");

      gsap.to("[data-orb='1']", {
        y: -120,
        scrollTrigger: { trigger: ref.current, scrub: 1.5 },
      });
      gsap.to("[data-orb='2']", {
        y: -80,
        scrollTrigger: { trigger: ref.current, scrub: 1.5 },
      });
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={ref}
      className="relative flex h-screen flex-col items-center justify-center overflow-hidden"
    >
      {/* Gradient orbs */}
      <div
        data-orb="1"
        className="absolute -right-[10%] -top-[15%] h-[300px] w-[300px] rounded-full bg-paprika opacity-[0.12] blur-[100px] md:h-[600px] md:w-[600px]"
      />
      <div
        data-orb="2"
        className="absolute -bottom-[10%] -left-[5%] h-[200px] w-[200px] rounded-full bg-charcoal-200 opacity-[0.15] blur-[100px] md:h-[400px] md:w-[400px]"
      />

      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(245,242,233,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(245,242,233,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <h1 className="relative z-[2] text-center text-[clamp(3.5rem,12vw,11rem)] font-light leading-[0.9] tracking-[-0.04em] text-floral">
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
            <span className="italic text-paprika">finally</span> clear.
          </span>
        </span>
      </h1>

      <p className="mt-8 max-w-[28rem] overflow-hidden px-6 text-center text-[clamp(0.85rem,1.2vw,1rem)] leading-[1.7] tracking-[0.02em] text-dust-400 md:mt-10">
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

      <div className="mt-10 overflow-hidden md:mt-12">
        <Link
          href="/sign-up"
          data-hero-cta
          className="inline-flex items-center gap-3 rounded-full border border-paprika/40 bg-paprika/10 px-8 py-3 text-[0.8rem] font-medium uppercase tracking-[0.1em] text-paprika backdrop-blur-sm transition-all duration-300 hover:bg-paprika hover:text-floral"
          style={{ transform: "translateY(100%)", opacity: 0 }}
        >
          Start for free
          <span className="transition-transform duration-300 group-hover:translate-x-1">&#8594;</span>
        </Link>
      </div>
    </section>
  );
}

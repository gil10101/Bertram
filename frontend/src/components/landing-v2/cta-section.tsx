"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "@/lib/gsap";
import { AnimatedBeam } from "./animated-beam";

const ctaBeamPaths = [
  { id: "c1", from: "cn1", to: "cn3", delay: 0, duration: 7, gradient: ["#eb5e28", "#9333ea"] as [string, string] },
  { id: "c2", from: "cn2", to: "cn4", delay: 1.5, duration: 6, gradient: ["#9333ea", "#eb5e28"] as [string, string] },
  { id: "c3", from: "cn3", to: "cn5", delay: 3, duration: 8, gradient: ["#f59e0b", "#9333ea"] as [string, string] },
];

export function CtaSection() {
  const ref = useRef<HTMLElement>(null);
  const beamContainerRef = useRef<HTMLDivElement>(null);
  const [beamMounted, setBeamMounted] = useState(false);

  useEffect(() => {
    setBeamMounted(true);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: ref.current, start: "top 60%" },
      });
      tl.to("[data-cta-line]", {
        y: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power4.out",
      }).to("[data-cta-btn]", { opacity: 1, y: 0, duration: 0.6 }, "-=0.4");
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={ref}
      id="cta"
      className="relative overflow-hidden border-t border-charcoal-400/20 px-6 py-40 text-center md:px-12 md:py-60"
    >
      <div className="absolute left-1/2 -top-[30%] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-paprika opacity-[0.06] blur-[100px]" />

      {/* Ambient beam network */}
      <div
        ref={beamContainerRef}
        className="pointer-events-none absolute inset-0"
      >
        <div data-beam="cn1" className="absolute left-[10%] top-[30%] h-2 w-2" />
        <div data-beam="cn2" className="absolute right-[15%] top-[20%] h-2 w-2" />
        <div data-beam="cn3" className="absolute left-[45%] top-[55%] h-2 w-2" />
        <div data-beam="cn4" className="absolute left-[20%] bottom-[20%] h-2 w-2" />
        <div data-beam="cn5" className="absolute right-[10%] bottom-[25%] h-2 w-2" />
        {beamMounted && beamContainerRef.current && (
          <AnimatedBeam
            containerRef={beamContainerRef}
            paths={ctaBeamPaths}
            opacity={0.08}
            strokeWidth={1.5}
            curvature={50}
          />
        )}
      </div>

      <h2 className="relative z-[1] text-[clamp(3rem,9vw,9rem)] font-light leading-[0.9] tracking-[-0.04em] text-floral">
        <span className="block overflow-hidden">
          <span
            data-cta-line
            className="block"
            style={{ transform: "translateY(110%)" }}
          >
            Take back your
          </span>
        </span>
        <span className="block overflow-hidden">
          <span
            data-cta-line
            className="block"
            style={{ transform: "translateY(110%)" }}
          >
            <span className="font-serif italic text-paprika">inbox</span> today.
          </span>
        </span>
      </h2>

      <Link
        href="/sign-up"
        data-cta-btn
        className="group relative z-[1] mt-10 inline-flex items-center gap-4 rounded-full border border-paprika/30 bg-paprika/10 px-8 py-4 text-[0.8rem] font-medium uppercase tracking-[0.12em] text-paprika backdrop-blur-sm transition-all duration-[400ms] hover:bg-paprika hover:text-floral md:mt-16 md:px-12 md:py-5"
        style={{ opacity: 0, transform: "translateY(20px)" }}
      >
        Get started free
        <span className="transition-transform duration-300 group-hover:translate-x-1">
          &#8594;
        </span>
      </Link>
    </section>
  );
}

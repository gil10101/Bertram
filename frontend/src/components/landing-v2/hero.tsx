"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "@/lib/gsap";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { AnimatedBeam } from "./animated-beam";
import { InboxMockup } from "./inbox-mockup";

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring" as const,
        bounce: 0.15,
        duration: 1.5,
      },
    },
  },
};

const heroBeamPaths = [
  { id: "h1", from: "hn1", to: "hn3", delay: 0, duration: 6, gradient: ["#eb5e28", "#9333ea"] as [string, string] },
  { id: "h2", from: "hn2", to: "hn4", delay: 2, duration: 7, gradient: ["#9333ea", "#eb5e28"] as [string, string] },
  { id: "h3", from: "hn3", to: "hn5", delay: 1, duration: 5, gradient: ["#eb5e28", "#f59e0b"] as [string, string] },
  { id: "h4", from: "hn1", to: "hn5", delay: 3, duration: 8, gradient: ["#9333ea", "#f59e0b"] as [string, string] },
];

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const beamContainerRef = useRef<HTMLDivElement>(null);
  const [beamMounted, setBeamMounted] = useState(false);

  useEffect(() => {
    setBeamMounted(true);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to("[data-orb='1']", {
        y: -120,
        scrollTrigger: { trigger: sectionRef.current, scrub: 1.5 },
      });
      gsap.to("[data-orb='2']", {
        y: -80,
        scrollTrigger: { trigger: sectionRef.current, scrub: 1.5 },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden">
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
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(245,242,233,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(245,242,233,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Ambient beam network */}
      <div
        ref={beamContainerRef}
        className="pointer-events-none absolute inset-0"
      >
        <div data-beam="hn1" className="absolute left-[15%] top-[20%] h-2 w-2" />
        <div data-beam="hn2" className="absolute right-[20%] top-[25%] h-2 w-2" />
        <div data-beam="hn3" className="absolute left-[40%] top-[60%] h-2 w-2" />
        <div data-beam="hn4" className="absolute left-[25%] bottom-[25%] h-2 w-2" />
        <div data-beam="hn5" className="absolute right-[15%] bottom-[30%] h-2 w-2" />
        {beamMounted && beamContainerRef.current && (
          <AnimatedBeam
            containerRef={beamContainerRef}
            paths={heroBeamPaths}
            opacity={0.1}
            strokeWidth={1.5}
            curvature={60}
          />
        )}
      </div>

      <div className="relative pt-28 md:pt-40">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
            <AnimatedGroup variants={transitionVariants}>
              {/* Heading */}
              <h1 className="mx-auto max-w-4xl text-balance text-[clamp(3rem,7vw,5.25rem)] font-light leading-[0.95] tracking-[-0.04em] text-floral">
                Your inbox,{" "}
                <span className="font-serif italic text-paprika">finally</span>{" "}
                clear.
              </h1>

              {/* Subtitle */}
              <p className="mx-auto mt-8 max-w-2xl text-balance text-lg leading-[1.7] tracking-[0.01em] text-dust-400">
                AI-powered email. Smart replies. Scheduled meetings. One
                beautifully simple interface.
              </p>
            </AnimatedGroup>

            {/* CTA buttons */}
            <AnimatedGroup
              variants={{
                container: {
                  hidden: {},
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 0.5,
                    },
                  },
                },
                ...transitionVariants,
              }}
              className="mt-12 flex flex-col items-center justify-center gap-3 md:flex-row"
            >
              <div className="rounded-[14px] border border-paprika/20 bg-paprika/10 p-0.5">
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center rounded-xl bg-paprika px-6 py-2.5 text-sm font-medium text-floral transition-colors duration-300 hover:bg-paprika-500"
                >
                  <span className="text-nowrap">Start for free</span>
                </Link>
              </div>

              <Link
                href="#features"
                className="inline-flex items-center justify-center rounded-xl px-6 py-2.5 text-sm font-medium text-dust-400 transition-colors duration-300 hover:text-floral"
              >
                <span className="text-nowrap">See how it works</span>
              </Link>
            </AnimatedGroup>
          </div>
        </div>

        {/* Inbox mockup card */}
        <AnimatedGroup
          variants={{
            container: {
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.05,
                  delayChildren: 0.75,
                },
              },
            },
            ...transitionVariants,
          }}
        >
          <div className="relative -mr-56 mt-10 overflow-hidden px-2 sm:mr-0 sm:mt-16 md:mt-20">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-transparent from-35% to-carbon-500"
            />
            <div className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl border border-charcoal-400/30 bg-carbon-400 p-3 shadow-lg shadow-black/20 sm:p-4">
              <div
                className="aspect-[15/8] overflow-hidden rounded-xl"
                role="img"
                aria-label="Preview of Bertram's inbox interface"
                aria-hidden="true"
              >
                <InboxMockup />
              </div>
            </div>
          </div>
        </AnimatedGroup>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "@/lib/gsap";

export function CtaSection() {
  const ref = useRef<HTMLElement>(null);

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
      className="bg-carbon text-floral py-40 px-6 md:py-60 md:px-12 text-center relative overflow-hidden"
    >
      <div className="absolute w-[600px] h-[600px] rounded-full blur-[80px] opacity-[0.06] bg-paprika -top-[30%] left-1/2 -translate-x-1/2" />

      <h2 className="text-[clamp(3rem,9vw,9rem)] font-light tracking-[-0.04em] leading-[0.9] relative z-[1]">
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
            <em className="font-serif italic">inbox</em> today.
          </span>
        </span>
      </h2>

      <Link
        href="/sign-up"
        data-cta-btn
        className="inline-flex items-center gap-4 mt-10 md:mt-16 text-[0.8rem] uppercase tracking-[0.12em] font-medium py-4 px-8 md:py-5 md:px-12 border border-floral/20 rounded-full text-floral bg-transparent hover:bg-floral hover:text-carbon hover:border-floral transition-all duration-[400ms] relative z-[1] group"
        style={{ opacity: 0, transform: "translateY(20px)" }}
      >
        Get started free
        <span className="transition-transform duration-300 group-hover:translate-x-1">
          →
        </span>
      </Link>
    </section>
  );
}

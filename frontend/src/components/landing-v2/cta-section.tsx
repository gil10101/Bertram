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
      className="relative overflow-hidden border-t border-charcoal-400/20 px-6 py-40 text-center md:px-12 md:py-60"
    >
      <div className="absolute left-1/2 -top-[30%] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-paprika opacity-[0.06] blur-[100px]" />

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
            <span className="italic text-paprika">inbox</span> today.
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

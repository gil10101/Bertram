"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

interface WordProps {
  children: string;
  className?: string;
}

function Word({ children, className = "" }: WordProps) {
  return (
    <span className="inline-block overflow-hidden align-top mr-[0.25em]">
      <span
        data-intro-word
        className={`inline-block ${className}`}
        style={{ transform: "translateY(100%)" }}
      >
        {children}
      </span>
    </span>
  );
}

export function Intro() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to("[data-intro-word]", {
        y: 0,
        duration: 0.6,
        stagger: 0.03,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 75%",
        },
      });
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={ref}
      id="intro"
      className="py-32 px-6 md:py-48 md:px-12 max-w-[1400px] mx-auto"
    >
      <p className="text-[clamp(2rem,5vw,4.5rem)] font-light tracking-[-0.03em] leading-[1.15] max-w-[55rem]">
        <Word>We</Word>
        <Word>believe</Word>
        <Word>managing</Word>
        <Word>email</Word>
        <Word>should</Word>
        <Word>feel</Word>
        <Word className="font-serif italic text-paprika">effortless</Word>
        <Word>—</Word>
        <Word>not</Word>
        <Word>like</Word>
        <Word>a</Word>
        <Word>second</Word>
        <Word>job.</Word>
        <Word>Bertram</Word>
        <Word>reads</Word>
        <Word>every</Word>
        <Word>message,</Word>
        <Word>drafts</Word>
        <Word>the</Word>
        <Word className="font-serif italic text-paprika">replies,</Word>
        <Word>and</Word>
        <Word>schedules</Word>
        <Word>the</Word>
        <Word>meetings</Word>
        <Word>so</Word>
        <Word>you</Word>
        <Word>don&apos;t</Word>
        <Word>have</Word>
        <Word>to.</Word>
      </p>
    </section>
  );
}

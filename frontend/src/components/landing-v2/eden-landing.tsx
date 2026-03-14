"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/* ═══════════════════════════ PALETTE ═══════════════════════════ */
const C = {
  bg: "#052415",
  surface: "#0a3320",
  white: "#ffffff",
  cream: "#f4f2f0",
} as const;

/* ═══════════════════════════ DATA ══════════════════════════════ */

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#integrations", label: "Integrations" },
  { href: "#cta", label: "Get Started" },
];

const marqueeItems = [
  "Gmail",
  "Outlook",
  "Google Calendar",
  "Slack",
  "Notion",
  "Linear",
  "Zoom",
  "Microsoft Teams",
];

const features = [
  {
    label: "Summaries",
    title: "Read Less, Decide Faster",
    desc: "Every email distilled to what matters. Long threads become three bullet points. Bertram reads everything so you don't have to.",
    mockup: "inbox-summary",
  },
  {
    label: "Smart Replies",
    title: "Let AI Draft, You Send",
    desc: "One-click replies that match your tone. Bertram learns how you write and drafts responses you'd actually send — review, edit, or just hit send.",
    mockup: "smart-reply",
  },
  {
    label: "Scheduling",
    title: "Meetings Without The Back-And-Forth",
    desc: "Bertram detects scheduling requests, checks your calendar, and proposes times. The meeting gets booked. You never open a second tab.",
    mockup: "scheduling",
  },
];

const bentoItems = [
  { title: "Priority Inbox", desc: "AI ranks what matters. Newsletters and noise move out of sight.", span: "md:col-span-2" },
  { title: "Thread Intelligence", desc: "Summarize, classify, and surface action items from any thread.", span: "" },
  { title: "Quick Capture", desc: "Forward an email to Bertram and it gets filed, tagged, and ready.", span: "" },
  { title: "AI That Learns You", desc: "The more you use Bertram, the better it gets. Tone, priority, timing — all personalized.", span: "md:col-span-2" },
];

const mockEmails = [
  { from: "Sarah Chen", subject: "Q3 Planning — Action items from today's call", tag: "Priority", time: "2m ago" },
  { from: "Linear", subject: "3 issues assigned to you", tag: "Automated", time: "15m ago" },
  { from: "David Park", subject: "Re: Can we move Thursday's standup?", tag: "Scheduling", time: "1h ago" },
  { from: "Figma", subject: "You were mentioned in Brand System v2", tag: "", time: "2h ago" },
  { from: "Alex Rivera", subject: "Contract review — needs signature by Friday", tag: "Priority", time: "3h ago" },
];

/* ═══════════════════════════ NOISE TEXTURE ═════════════════════ */

function NoiseBg() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
        backgroundSize: "128px 128px",
      }}
    />
  );
}

/* ═══════════════════════════ TILT CARD ═════════════════════════ */

function TiltCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [4, -4]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-4, 4]), { stiffness: 200, damping: 20 });

  const handleMouse = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }, [x, y]);

  const handleLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════ NAVBAR ════════════════════════════ */

function Navbar({ isSignedIn }: { isSignedIn: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.1, 0, 1] }}
        className={`fixed left-0 right-0 top-0 z-[100] transition-all duration-500 ${
          scrolled ? "bg-[#052415]/90 backdrop-blur-xl" : ""
        }`}
      >
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 md:px-10 md:py-5">
          <Link href="/" className="text-[1.1rem] font-semibold tracking-[-0.02em] text-white">
            Bertram
          </Link>

          <div className="hidden items-center gap-8 text-[0.85rem] md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-white/50 transition-colors duration-300 hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <Link
              href={isSignedIn ? "/inbox" : "/sign-in"}
              className="text-[0.85rem] text-white/50 transition-colors duration-300 hover:text-white"
            >
              {isSignedIn ? "Open App" : "Log In"}
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg bg-white px-4 py-2 text-[0.85rem] font-medium text-[#052415] transition-opacity duration-300 hover:opacity-90"
            >
              Sign Up
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex flex-col gap-[5px] p-1 md:hidden"
            aria-label="Toggle menu"
          >
            <span className={`block h-px w-5 bg-white transition-all duration-300 ${mobileOpen ? "translate-y-[6px] rotate-45" : ""}`} />
            <span className={`block h-px w-5 bg-white transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
            <span className={`block h-px w-5 bg-white transition-all duration-300 ${mobileOpen ? "-translate-y-[6px] -rotate-45" : ""}`} />
          </button>
        </div>
      </motion.nav>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-[99] flex flex-col items-center justify-center gap-8 bg-[#052415]/98 backdrop-blur-xl transition-all duration-500 md:hidden ${
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={() => setMobileOpen(false)}
            className="text-xl text-white/70 transition-colors hover:text-white"
          >
            {link.label}
          </a>
        ))}
        <Link
          href="/sign-up"
          onClick={() => setMobileOpen(false)}
          className="mt-4 rounded-lg bg-white px-6 py-3 text-[0.85rem] font-medium text-[#052415]"
        >
          Sign Up
        </Link>
      </div>
    </>
  );
}

/* ═══════════════════════════ HERO ══════════════════════════════ */

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const productRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Main entrance timeline
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.to("[data-eden-line]", { y: 0, duration: 1.2, stagger: 0.1, delay: 0.3 })
        .to("[data-eden-sub]", { y: 0, opacity: 1, duration: 0.9 }, "-=0.6")
        .to("[data-eden-cta]", { y: 0, opacity: 1, duration: 0.8 }, "-=0.5")
        .to("[data-eden-note]", { opacity: 1, duration: 0.6 }, "-=0.3")
        .to("[data-eden-product]", { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" }, "-=0.4")
        // Stagger sidebar items in from left
        .to("[data-sidebar-item]", {
          x: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.06,
          ease: "power3.out",
        }, "-=0.6")
        // Stagger email rows in from right
        .to("[data-email-row]", {
          x: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: "power3.out",
        }, "-=0.7");

      // Scroll-driven parallax on product mockup
      if (productRef.current) {
        gsap.to(productRef.current, {
          scale: 0.92,
          opacity: 0.4,
          y: -60,
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "bottom bottom",
            end: "bottom top",
            scrub: 1.5,
          },
        });
      }
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="relative overflow-hidden pb-0 pt-32 md:pt-40">
      <NoiseBg />

      {/* Subtle radial glow behind hero text */}
      <div
        className="pointer-events-none absolute left-1/2 top-[20%] h-[600px] w-[600px] -translate-x-1/2 rounded-full opacity-[0.07]"
        style={{ background: "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)" }}
      />

      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="mx-auto max-w-[900px] text-center">
          <h1 className="text-[clamp(2.8rem,7vw,5.5rem)] font-medium leading-[1.05] tracking-[-0.03em] text-white">
            <span className="block overflow-hidden">
              <span data-eden-line className="block" style={{ transform: "translateY(110%)" }}>
                Your entire inbox
              </span>
            </span>
            <span className="block overflow-hidden">
              <span data-eden-line className="block" style={{ transform: "translateY(110%)" }}>
                managed by AI
              </span>
            </span>
          </h1>

          <p
            data-eden-sub
            className="mx-auto mt-6 max-w-[520px] text-[clamp(0.95rem,1.3vw,1.1rem)] leading-[1.6] text-white/50 md:mt-8"
            style={{ transform: "translateY(20px)", opacity: 0 }}
          >
            Connect your email. Bertram reads, summarizes, drafts replies, and schedules meetings — so you can focus on work that matters.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 md:mt-10">
            <Link
              href="/sign-up"
              data-eden-cta
              className="rounded-lg bg-white px-6 py-3 text-[0.95rem] font-medium text-[#052415] transition-all duration-300 hover:opacity-90 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]"
              style={{ transform: "translateY(20px)", opacity: 0 }}
            >
              Try Bertram Free
            </Link>
            <span
              data-eden-note
              className="text-[0.8rem] text-white/30"
              style={{ opacity: 0 }}
            >
              No credit card required. Works with Gmail and Outlook.
            </span>
          </div>
        </div>

        {/* Product visual — embedded dashboard mockup */}
        <div
          ref={productRef}
          data-eden-product
          className="relative mx-auto mt-16 max-w-[1100px] md:mt-20"
          style={{ opacity: 0, transform: "translateY(60px)" }}
        >
          <TiltCard className="will-change-transform">
            <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0a3320] shadow-2xl shadow-black/30">
              {/* Mock window chrome */}
              <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
                <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                <div className="mx-auto rounded-md bg-white/[0.05] px-16 py-1.5 text-[0.7rem] text-white/20">
                  app.bertram.ai
                </div>
              </div>

              {/* Mock dashboard */}
              <div className="flex min-h-[350px] md:min-h-[500px]">
                {/* Sidebar */}
                <div className="hidden w-[200px] shrink-0 border-r border-white/[0.06] p-4 md:block">
                  <div className="mb-6 text-[0.8rem] font-medium text-white/70">Bertram</div>
                  {["Inbox", "Priority", "Drafts", "Scheduled", "Archive"].map((item, i) => (
                    <div
                      key={item}
                      data-sidebar-item
                      className={`mb-1 rounded-md px-3 py-2 text-[0.8rem] ${
                        i === 0 ? "bg-white/[0.08] text-white" : "text-white/30"
                      }`}
                      style={{ opacity: 0, transform: "translateX(-20px)" }}
                    >
                      {item}
                    </div>
                  ))}
                </div>

                {/* Email list */}
                <div className="flex-1 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-[0.85rem] font-medium text-white/70">Inbox</span>
                    <span className="rounded-full bg-white/[0.08] px-2.5 py-0.5 text-[0.7rem] text-white/40">12 unread</span>
                  </div>
                  {mockEmails.map((email) => (
                    <div
                      key={email.subject}
                      data-email-row
                      className="flex items-start gap-3 border-b border-white/[0.04] py-3"
                      style={{ opacity: 0, transform: "translateX(30px)" }}
                    >
                      <div className="mt-0.5 h-7 w-7 shrink-0 rounded-full bg-white/[0.08]" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[0.8rem] font-medium text-white/80">{email.from}</span>
                          {email.tag && (
                            <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[0.6rem] text-white/30">
                              {email.tag}
                            </span>
                          )}
                          <span className="ml-auto shrink-0 text-[0.7rem] text-white/20">{email.time}</span>
                        </div>
                        <p className="truncate text-[0.8rem] text-white/40">{email.subject}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TiltCard>

          {/* Fade to bg at the bottom */}
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-32"
            style={{ background: `linear-gradient(transparent, ${C.bg})` }}
          />
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════ PROBLEM — WORD REVEAL ═════════════ */

const problemHeadline = "ChatGPT doesn't have your inbox. Notion doesn't draft replies. Your email client doesn't have AI.";

function Problem() {
  const ref = useRef<HTMLElement>(null);
  const wordsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Label fade in
      gsap.to("[data-problem-label]", {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 75%" },
      });

      // Word-by-word scrub reveal
      const words = wordsRef.current?.querySelectorAll("[data-word]");
      if (words?.length) {
        gsap.to(words, {
          opacity: 1,
          stagger: 0.05,
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 60%",
            end: "bottom 60%",
            scrub: true,
          },
        });
      }

      // Subtitle fades in after words
      gsap.to("[data-problem-sub]", {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "center 55%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="relative py-32 md:py-48">
      <div className="mx-auto max-w-[1400px] px-6 text-center md:px-10">
        <p
          data-problem-label
          className="text-[0.8rem] font-medium uppercase tracking-[0.12em] text-white/30"
          style={{ opacity: 0, transform: "translateY(20px)" }}
        >
          Your email + AI that actually works
        </p>
        <div
          ref={wordsRef}
          className="mx-auto mt-6 max-w-[750px] text-[clamp(1.8rem,4vw,3rem)] font-medium leading-[1.2] tracking-[-0.02em]"
        >
          {problemHeadline.split(" ").map((word, i) => (
            <span key={i} data-word className="inline-block text-white" style={{ opacity: 0.12 }}>
              {word}&nbsp;
            </span>
          ))}
        </div>
        <p
          data-problem-sub
          className="mx-auto mt-6 max-w-[480px] text-[1rem] leading-[1.6] text-white/40"
          style={{ opacity: 0, transform: "translateY(20px)" }}
        >
          Bertram is the missing layer — AI that lives inside your email, with full context of every thread, contact, and calendar event.
        </p>
      </div>
    </section>
  );
}

/* ═══════════════════════════ FEATURES ══════════════════════════ */

function FeatureBlock({
  feature,
  index,
  reversed,
}: {
  feature: (typeof features)[0];
  index: number;
  reversed?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: ref.current, start: "top 75%" },
        defaults: { ease: "power3.out" },
      });

      // Text side — staggered label, title, desc
      tl.to(ref.current!.querySelectorAll("[data-ft-text]"), {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.12,
      });

      // Mockup slides in from the opposite side with slight rotation
      tl.to(ref.current!.querySelector("[data-ft-mockup]")!, {
        opacity: 1,
        x: 0,
        rotateZ: 0,
        duration: 0.9,
        ease: "power3.out",
      }, "-=0.5");

      // Inner mockup content staggers in
      tl.to(ref.current!.querySelectorAll("[data-ft-inner]"), {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.07,
        ease: "power3.out",
      }, "-=0.3");
    }, ref);
    return () => ctx.revert();
  }, []);

  const mockupInitX = reversed ? -60 : 60;
  const mockupInitRot = reversed ? -2 : 2;

  return (
    <div
      ref={ref}
      className={`flex flex-col gap-8 md:gap-12 ${reversed ? "md:flex-row-reverse" : "md:flex-row"} items-center`}
    >
      {/* Text */}
      <div className="flex-1 md:max-w-[440px]">
        <span
          data-ft-text
          className="text-[0.75rem] font-medium uppercase tracking-[0.12em] text-white/30"
          style={{ opacity: 0, transform: "translateY(16px)" }}
        >
          {feature.label}
        </span>
        <h3
          data-ft-text
          className="mt-3 text-[clamp(1.6rem,3vw,2.4rem)] font-medium leading-[1.15] tracking-[-0.02em] text-white"
          style={{ opacity: 0, transform: "translateY(16px)" }}
        >
          {feature.title}
        </h3>
        <p
          data-ft-text
          className="mt-4 text-[0.95rem] leading-[1.65] text-white/45"
          style={{ opacity: 0, transform: "translateY(16px)" }}
        >
          {feature.desc}
        </p>
      </div>

      {/* Visual mockup with tilt */}
      <div className="relative w-full flex-1">
        <TiltCard>
          <div
            data-ft-mockup
            className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0a3320] transition-shadow duration-500 hover:shadow-[0_0_40px_rgba(255,255,255,0.04)]"
            style={{ opacity: 0, transform: `translateX(${mockupInitX}px) rotate(${mockupInitRot}deg)` }}
          >
            <NoiseBg />
            <div className="relative flex aspect-[4/3] items-center justify-center">
              <FeatureMockup type={feature.mockup} />
            </div>
          </div>
        </TiltCard>
      </div>
    </div>
  );
}

function FeatureMockup({ type }: { type: string }) {
  if (type === "inbox-summary") {
    return (
      <div className="w-full max-w-[360px] p-6">
        <div
          data-ft-inner
          className="mb-4 rounded-lg border border-white/[0.06] bg-white/[0.03] p-4"
          style={{ opacity: 0, transform: "translateY(12px)" }}
        >
          <div className="mb-2 text-[0.75rem] font-medium text-white/60">AI Summary</div>
          <div className="space-y-2">
            {[
              "Team agreed to move launch to March 15th",
              "Sarah to finalize design specs by Friday",
              "Budget approved — no further sign-off needed",
            ].map((text, i) => (
              <div
                key={i}
                data-ft-inner
                className="flex items-start gap-2"
                style={{ opacity: 0, transform: "translateY(8px)" }}
              >
                <span className="mt-1 text-[0.7rem] text-white/30">{i + 1}.</span>
                <span className="text-[0.8rem] leading-[1.5] text-white/50">{text}</span>
              </div>
            ))}
          </div>
        </div>
        <div
          data-ft-inner
          className="text-[0.7rem] text-white/20"
          style={{ opacity: 0, transform: "translateY(8px)" }}
        >
          Summarized from 14 messages
        </div>
      </div>
    );
  }
  if (type === "smart-reply") {
    return (
      <div className="w-full max-w-[360px] p-6">
        <div
          data-ft-inner
          className="mb-3 rounded-lg border border-white/[0.06] bg-white/[0.03] p-4"
          style={{ opacity: 0, transform: "translateY(12px)" }}
        >
          <div className="mb-2 text-[0.7rem] text-white/30">From: Sarah Chen</div>
          <div className="text-[0.8rem] leading-[1.5] text-white/50">Can you review the proposal and share feedback by EOD?</div>
        </div>
        <div className="space-y-2">
          {["Sure, I'll take a look this afternoon.", "Already on it — will send notes by 4pm.", "Can we push to tomorrow morning? Swamped today."].map((reply) => (
            <button
              key={reply}
              data-ft-inner
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-left text-[0.8rem] text-white/50 transition-all duration-300 hover:bg-white/[0.07] hover:border-white/[0.12]"
              style={{ opacity: 0, transform: "translateY(8px)" }}
            >
              {reply}
            </button>
          ))}
        </div>
      </div>
    );
  }
  // scheduling
  return (
    <div className="w-full max-w-[360px] p-6">
      <div
        data-ft-inner
        className="mb-3 rounded-lg border border-white/[0.06] bg-white/[0.03] p-4"
        style={{ opacity: 0, transform: "translateY(12px)" }}
      >
        <div className="mb-2 text-[0.7rem] text-white/30">Detected: Scheduling request</div>
        <div className="text-[0.8rem] leading-[1.5] text-white/50">&quot;Can we find 30 minutes to sync on the roadmap this week?&quot;</div>
      </div>
      <div
        data-ft-inner
        className="mb-3 text-[0.75rem] font-medium text-white/40"
        style={{ opacity: 0, transform: "translateY(8px)" }}
      >
        Suggested times
      </div>
      <div className="space-y-2">
        {["Tue, Mar 10 · 2:00–2:30 PM", "Wed, Mar 11 · 10:00–10:30 AM", "Thu, Mar 12 · 4:00–4:30 PM"].map((slot) => (
          <div
            key={slot}
            data-ft-inner
            className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 transition-colors duration-300 hover:border-white/[0.1]"
            style={{ opacity: 0, transform: "translateY(8px)" }}
          >
            <span className="text-[0.8rem] text-white/50">{slot}</span>
            <span className="text-[0.7rem] text-white/20">Available</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="relative py-20 md:py-32">
      <NoiseBg />
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="space-y-24 md:space-y-36">
          {features.map((f, i) => (
            <FeatureBlock key={f.label} feature={f} index={i} reversed={i % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════ BENTO GRID ════════════════════════ */

function BentoGrid() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title section
      gsap.to("[data-bento-title]", {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 70%" },
      });

      // Cards with scale + stagger
      gsap.to("[data-bento]", {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 55%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="relative bg-[#031a0e] py-24 md:py-36">
      <NoiseBg />
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="mb-12 text-center md:mb-16">
          <p
            data-bento-title
            className="text-[0.8rem] font-medium uppercase tracking-[0.12em] text-white/30"
            style={{ opacity: 0, transform: "translateY(16px)" }}
          >
            Everything else
          </p>
          <h2
            data-bento-title
            className="mt-4 text-[clamp(1.8rem,4vw,3rem)] font-medium leading-[1.15] tracking-[-0.02em] text-white"
            style={{ opacity: 0, transform: "translateY(16px)" }}
          >
            AI That Knows Your Entire Inbox
          </h2>
          <p
            data-bento-title
            className="mx-auto mt-4 max-w-[480px] text-[1rem] leading-[1.6] text-white/40"
            style={{ opacity: 0, transform: "translateY(16px)" }}
          >
            If AI could read all your email, how much time would you have for the work that moves the needle?
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {bentoItems.map((item) => (
            <motion.div
              key={item.title}
              data-bento
              whileHover={{ scale: 1.03, borderColor: "rgba(255,255,255,0.12)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`cursor-default rounded-xl border border-white/[0.06] bg-white/[0.03] p-6 md:p-8 ${item.span}`}
              style={{ opacity: 0, transform: "translateY(24px) scale(0.92)" }}
            >
              <h3 className="mb-2 text-[1rem] font-medium text-white/80">{item.title}</h3>
              <p className="text-[0.85rem] leading-[1.6] text-white/35">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════ MARQUEE ═══════════════════════════ */

function MarqueeContent() {
  return (
    <span className="flex shrink-0 items-center gap-14">
      {marqueeItems.map((item, i) => (
        <span key={i} className="flex items-center gap-14">
          {item}
          <span className="h-1 w-1 shrink-0 rounded-full bg-white/20" />
        </span>
      ))}
    </span>
  );
}

function MarqueeSection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const speedRef = useRef(0.35);
  const targetSpeedRef = useRef(0.35);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let pos = 0;
    let rafId: number;
    const firstSpan = track.children[0] as HTMLElement;

    function tick() {
      // Smoothly interpolate speed toward target
      speedRef.current += (targetSpeedRef.current - speedRef.current) * 0.08;
      pos -= speedRef.current;
      if (firstSpan && pos <= -(firstSpan.offsetWidth + 56)) pos = 0;
      track!.style.transform = `translateX(${pos}px)`;
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const handleMouseEnter = () => { targetSpeedRef.current = 0.05; };
  const handleMouseLeave = () => {
    // Brief speed burst, then back to normal
    targetSpeedRef.current = 0.8;
    setTimeout(() => { targetSpeedRef.current = 0.35; }, 600);
  };

  return (
    <section
      id="integrations"
      className="overflow-hidden border-b border-t border-white/[0.06] py-7"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
      }}
    >
      <div
        ref={trackRef}
        className="flex gap-14 whitespace-nowrap text-[clamp(0.9rem,1.8vw,1.3rem)] font-light tracking-[-0.01em] text-white/40 will-change-transform"
      >
        <MarqueeContent />
        <MarqueeContent />
      </div>
    </section>
  );
}

/* ═══════════════════════════ CTA — CHAR REVEAL + FOOTER ═══════ */

const ctaHeadline = "Your email, finally working for you.";

function CtaFooter() {
  const ref = useRef<HTMLElement>(null);
  const charsRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Label
      gsap.to("[data-cta-label]", {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 70%" },
      });

      // Character-by-character reveal
      const chars = charsRef.current?.querySelectorAll("[data-char]");
      if (chars?.length) {
        gsap.to(chars, {
          opacity: 1,
          y: 0,
          stagger: 0.02,
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 60%",
            end: "center 50%",
            scrub: true,
          },
        });
      }

      // Subtitle + button
      gsap.to("[data-cta-sub]", {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "center 55%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} id="cta" className="relative">
      <NoiseBg />

      {/* Subtle glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-[30%] h-[500px] w-[500px] -translate-x-1/2 rounded-full opacity-[0.05]"
        style={{ background: "radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)" }}
      />

      <div className="px-6 py-32 text-center md:px-10 md:py-44">
        <p
          data-cta-label
          className="text-[0.8rem] font-medium uppercase tracking-[0.12em] text-white/30"
          style={{ opacity: 0, transform: "translateY(20px)" }}
        >
          Experience Bertram today
        </p>
        <h2
          ref={charsRef}
          className="mx-auto mt-5 max-w-[700px] text-[clamp(2.2rem,6vw,4.5rem)] font-medium leading-[1.05] tracking-[-0.03em]"
        >
          {ctaHeadline.split("").map((char, i) => (
            <span
              key={i}
              data-char
              className="inline-block text-white"
              style={{ opacity: 0.1, transform: "translateY(8px)" }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </h2>
        <p
          data-cta-sub
          className="mx-auto mt-5 max-w-[420px] text-[1rem] leading-[1.6] text-white/40"
          style={{ opacity: 0, transform: "translateY(20px)" }}
        >
          Connect Gmail or Outlook. Bertram starts learning your inbox immediately.
        </p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.2 }}
          className="mt-8 md:mt-10"
        >
          <Link
            href="/sign-up"
            className="inline-flex rounded-lg bg-white px-6 py-3 text-[0.95rem] font-medium text-[#052415] transition-all duration-300 hover:opacity-90 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]"
          >
            Sign Up Free
          </Link>
        </motion.div>
      </div>

      <footer className="border-t border-white/[0.06] px-6 py-8 md:px-10">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-4 text-[0.75rem] text-white/25 md:flex-row">
          <span>&copy; 2026 Bertram</span>
          <div className="flex gap-8">
            <Link href="/privacy" className="transition-colors hover:text-white/50">Privacy</Link>
            <Link href="/terms" className="transition-colors hover:text-white/50">Terms</Link>
            <Link href="#" className="transition-colors hover:text-white/50">Twitter</Link>
            <Link href="#" className="transition-colors hover:text-white/50">GitHub</Link>
          </div>
        </div>
      </footer>
    </section>
  );
}

/* ═══════════════════════════ MAIN ══════════════════════════════ */

export function EdenLanding({ isSignedIn = false }: { isSignedIn?: boolean }) {
  return (
    <div className="bg-[#052415] overflow-x-hidden scroll-smooth">
      <Navbar isSignedIn={isSignedIn} />
      <Hero />
      <MarqueeSection />
      <Problem />
      <FeaturesSection />
      <BentoGrid />
      <CtaFooter />
    </div>
  );
}

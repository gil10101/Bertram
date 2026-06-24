"use client";

// Hero — centered editorial headline + the big animated Bertram product UI below.

import Link from "next/link";
import { Icon } from "./icons";
import { BertramDemo } from "./product";

const HEADLINE = "Email, finally finished.";
const SUBHEAD = "An AI inbox that works.";
const CTA = "Start with Gmail";

export function Hero({ isSignedIn = false }: { isSignedIn?: boolean }) {
  return (
    <section
      id="top"
      className="hero-section"
      style={{ position: "relative", paddingTop: 140, paddingBottom: 80, overflow: "hidden" }}
    >
      <BgGrid />

      {/* Centered hero text */}
      <div className="shell" style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
        <h1
          className="h-display"
          style={{ fontSize: "clamp(3.4rem, 9vw, 8rem)", maxWidth: "15ch", margin: "0 auto", letterSpacing: "-0.05em" }}
        >
          <HeadlineReveal text={HEADLINE} />
        </h1>

        <p className="lede" style={{ margin: "32px auto 0", textAlign: "center", maxWidth: 460 }}>
          {SUBHEAD}
        </p>

        <div
          className="hero-cta-row"
          style={{ marginTop: 40, display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}
        >
          <Link
            href={isSignedIn ? "/inbox" : "/sign-up"}
            className="btn btn-primary"
            style={{ whiteSpace: "nowrap", padding: "13px 22px", fontSize: 14.5 }}
          >
            {CTA}
            <span className="btn-arrow" />
          </Link>
          <a href="#product" className="btn btn-ghost mono see-it-work" style={{ fontSize: 12, whiteSpace: "nowrap" }}>
            <Icon name="sparkle" size={12} color="var(--paprika)" />
            See it work
          </a>
        </div>
      </div>

      {/* Big animated Bertram product UI — the full '04' cursor-driven demo */}
      <div className="hero-demo-wrap" style={{ position: "relative", zIndex: 2, marginTop: 80 }}>
        <BertramDemo controls={false} />
      </div>
    </section>
  );
}

/* ── Background grid (subtle) ──────────────────────── */
function BgGrid() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage:
          "linear-gradient(to right, var(--grid-line) 1px, transparent 1px), linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px)",
        backgroundSize: "80px 80px",
        maskImage: "radial-gradient(ellipse 80% 50% at 50% 20%, black 30%, transparent 80%)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 50% at 50% 20%, black 30%, transparent 80%)",
        pointerEvents: "none",
      }}
    />
  );
}

/* ── Headline: italic emphasis on "finally" ─── */
function HeadlineReveal({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <span>
      {words.map((w, i) => {
        const isItalic = /finally/i.test(w);
        return (
          <span key={i}>
            <span
              style={{
                fontStyle: isItalic ? "italic" : "normal",
                fontWeight: isItalic ? 400 : 500,
                color: isItalic ? "var(--ink-2)" : "var(--ink)",
              }}
            >
              {w}
            </span>
            {i < words.length - 1 && " "}
          </span>
        );
      })}
    </span>
  );
}

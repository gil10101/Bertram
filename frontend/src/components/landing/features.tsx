"use client";

import { useRef, useState, useEffect } from "react";

// Features — Felix-style scrolling views
// Left: scrolling text blocks. Right: sticky panel with soft gradient bg and
// ONE simple card per view (the actual product element for that feature, isolated).

const FEATURE_VIEWS = [
  {
    num: "01",
    kicker: "Sources",
    title: "Every channel,\none inbox.",
    desc: "Gmail, Outlook, iCloud — and the apps that already send you email. Bertram pulls Linear notifications, Notion mentions, Slack threads, GitHub PRs, Figma comments, and Stripe receipts into one timeline.",
    Card: SourcesCard,
  },
  {
    num: "02",
    kicker: "Summaries",
    title: "The gist,\nbefore the thread.",
    desc: "Every conversation arrives with the three lines that tell you what happened, what you owe, and when. Bertram reads the whole thread — including attached docs — so you scan instead of scroll.",
    Card: SummaryCard,
  },
  {
    num: "03",
    kicker: "Replies",
    title: "Replies in\nyour voice.",
    desc: "Bertram studies how you write — your cadence, your sign-offs, the kind of yes you say — and drafts responses that already sound like you. Review, edit, send. Or, if you trust it, just hit ↵.",
    Card: ReplyCard,
  },
  {
    num: "04",
    kicker: "Meetings",
    title: "Meetings,\nwithout the tabs.",
    desc: "When a message wants 30 minutes, Bertram reads your calendar, proposes times, and books the one they pick. The reply, the invite, and the follow-up — handled inline.",
    Card: SlotsCard,
  },
];

export function Features() {
  const sectionRef = useRef<any>(null);
  const blockRefs = [useRef<any>(null), useRef<any>(null), useRef<any>(null), useRef<any>(null)];
  const [active, setActive] = useState(0);

  useEffect(() => {
    let raf: any;
    const update = () => {
      const targetY = window.innerHeight * 0.45;
      let best = 0, bestDist = Infinity;
      blockRefs.forEach((ref, i) => {
        if (!ref.current) return;
        const r = ref.current.getBoundingClientRect();
        const c = r.top + r.height / 2;
        const d = Math.abs(c - targetY);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      setActive(best);
    };
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const scrollToBlock = (i: number) => {
    const el = blockRefs[i].current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const targetY = window.scrollY + rect.top - (window.innerHeight * 0.4);
    window.scrollTo({ top: targetY, behavior: "smooth" });
  };

  return (
    <section id="features" ref={sectionRef} className="features-section" style={{
      position: "relative",
      paddingTop: 120,
      paddingBottom: 120,
      background: "var(--bg)",
    }}>
      {/* Section header */}
      <div className="shell" style={{ marginBottom: 60 }}>
        <div className="features-header" style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.5fr",
          gap: 40,
          alignItems: "end",
        }}>
          <div className="eyebrow">/ 03 — What it does</div>
          <h2 className="h-display" style={{
            fontSize: "clamp(2.2rem, 4.6vw, 4rem)",
            maxWidth: "22ch",
            letterSpacing: "-0.04em",
          }}>
            One inbox for every place <span style={{ fontStyle: "italic", color: "var(--ink-2)", fontWeight: 400 }}>work</span> happens.
          </h2>
        </div>
      </div>

      <div className="shell">
        <div className="features-grid" style={{
          display: "grid",
          gridTemplateColumns: "0.85fr 1.15fr",
          gap: 80,
          alignItems: "start",
        }}>
          {/* LEFT — scrolling text blocks */}
          <div>
            {FEATURE_VIEWS.map((v, i) => (
              <div
                key={v.num}
                ref={blockRefs[i]}
                onClick={() => scrollToBlock(i)}
                role="button"
                tabIndex={0}
                onKeyDown={(e: any) => { if (e.key === "Enter" || e.key === " ") scrollToBlock(i); }}
                className="features-block"
                style={{
                  minHeight: "78vh",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  cursor: "pointer",
                  paddingLeft: 32,
                  borderLeft: active === i ? "1px solid var(--ink)" : "1px solid var(--rule)",
                  transition: "border-color .5s ease",
                }}
              >
                <div className="mono feat-num" style={{
                  fontSize: 11,
                  color: active === i ? "var(--paprika)" : "var(--ink-3)",
                  letterSpacing: "0.06em",
                  opacity: active === i ? 1 : 0.7,
                  transition: "color .5s ease, opacity .5s ease",
                }}>
                  [{v.num}] {v.kicker.toUpperCase()}
                </div>
                <h3 className="h-display feat-title" style={{
                  fontSize: "clamp(2rem, 3.6vw, 3rem)",
                  marginTop: 18,
                  whiteSpace: "pre-line",
                  maxWidth: "14ch",
                  color: active === i ? "var(--ink)" : "var(--ink-3)",
                  opacity: active === i ? 1 : 0.45,
                  transition: "color .6s ease, opacity .6s ease",
                }}>
                  {v.title}
                </h3>
                <p className="lede feat-desc" style={{
                  marginTop: 22,
                  maxWidth: "36ch",
                  color: active === i ? "var(--ink-2)" : "var(--ink-3)",
                  opacity: active === i ? 1 : 0.45,
                  transition: "color .6s ease, opacity .6s ease",
                }}>
                  {v.desc}
                </p>

                {/* Inline card — only visible on mobile via CSS */}
                <div className="features-inline-card">
                  <div className="features-soft-stage">
                    <v.Card />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT — sticky soft-gradient panel, simple card centered */}
          <div className="features-visual-col" style={{
            position: "sticky",
            top: "12vh",
            height: "76vh",
          }}>
            <SoftPanel>
              {FEATURE_VIEWS.map((v, i) => (
                <CardLayer key={v.num} visible={active === i}>
                  <v.Card />
                </CardLayer>
              ))}
            </SoftPanel>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .features-header { grid-template-columns: 1fr !important; align-items: start !important; gap: 16px !important; }
        }
      `}</style>
    </section>
  );
}

/* ── The soft gradient stage ──────────────────────── */
function SoftPanel({ children }: any) {
  return (
    <div style={{
      position: "relative",
      width: "100%",
      height: "100%",
      borderRadius: 18,
      overflow: "hidden",
      background: "var(--soft-grad, linear-gradient(160deg, #d9c9b4 0%, #efece4 50%, #ddd6c4 100%))",
      border: "1px solid var(--rule)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {/* subtle grain */}
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0,
        opacity: 0.06,
        mixBlendMode: "multiply",
        backgroundImage: "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
      }} />
      <div style={{
        position: "relative",
        width: "100%",
        maxWidth: 460,
        padding: "0 28px",
      }}>
        {children}
      </div>
    </div>
  );
}

function CardLayer({ visible, children }: any) {
  return (
    <div style={{
      gridArea: "1 / 1",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0) scale(1)" : "translateY(12px) scale(0.98)",
      transition: "opacity .55s ease, transform .65s cubic-bezier(.22,.61,.36,1)",
      pointerEvents: visible ? "auto" : "none",
      position: visible ? "relative" : "absolute",
      inset: visible ? "auto" : 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {children}
    </div>
  );
}

/* ─── Simple Felix-style cards ─── */

function CardShell({ children, label }: any) {
  return (
    <div style={{
      width: "100%",
      maxWidth: 400,
      borderRadius: 14,
      background: "var(--bg)",
      border: "1px solid var(--rule)",
      boxShadow: "0 24px 50px -25px rgba(0,0,0,0.25), 0 4px 14px -6px rgba(0,0,0,0.08)",
      overflow: "hidden",
    }}>
      {label && (
        <div style={{
          padding: "8px 14px",
          borderBottom: "1px solid var(--rule-2)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span className="mono" style={{ fontSize: 9.5, color: "var(--ink-3)", letterSpacing: "0.06em" }}>{label}</span>
          <div style={{ display: "flex", gap: 4 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--rule)" }}></span>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--rule)" }}></span>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--rule)" }}></span>
          </div>
        </div>
      )}
      <div style={{ padding: 18 }}>{children}</div>
    </div>
  );
}

function SourcesCard() {
  const sources = [
    { label: "Gmail",   c: "#ea4335", count: 47 },
    { label: "Outlook", c: "#0078d4", count: 22 },
    { label: "Linear",  c: "#5e6ad2", count: 8  },
    { label: "Notion",  c: "#191919", count: 4  },
    { label: "Slack",   c: "#611f69", count: 11 },
    { label: "GitHub",  c: "#0d1117", count: 3  },
  ];
  return (
    <CardShell label="6 of 8 connected">
      <div className="mono" style={{ fontSize: 10, color: "var(--paprika)", letterSpacing: "0.08em", marginBottom: 12 }}>
        ◆ LIVE SOURCES
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {sources.map((s: any, i: number) => (
          <div key={s.label} style={{
            display: "grid",
            gridTemplateColumns: "20px 1fr auto",
            gap: 10,
            alignItems: "center",
            padding: "10px 12px",
            border: "1px solid var(--rule)",
            background: "var(--bg-soft)",
            borderRadius: 7,
          }}>
            <span style={{
              width: 16, height: 16, borderRadius: 4,
              background: s.c,
              color: "#fff", fontSize: 9.5, fontFamily: "var(--font-mono)", fontWeight: 600,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>{s.label[0]}</span>
            <span style={{ fontSize: 12, fontWeight: 500, letterSpacing: "-0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.label}</span>
            <span className="mono" style={{ fontSize: 10, color: "var(--ink-3)" }}>{s.count}</span>
          </div>
        ))}
      </div>
      <div className="mono" style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 14, letterSpacing: "0.05em", textAlign: "center" }}>
        + ICLOUD · FIGMA · STRIPE
      </div>
    </CardShell>
  );
}

function SummaryCard() {
  return (
    <CardShell label="ai summary · 14 messages">
      <div className="mono" style={{ fontSize: 10, color: "var(--paprika)", letterSpacing: "0.08em", marginBottom: 14 }}>
        ◆ THE GIST
      </div>
      <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginBottom: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}>
        RE: Q3 PLANNING — SARAH CHEN
      </div>
      {[
        ["Revenue", "Q3 target $4.2M confirmed. Enterprise pilot TBD."],
        ["Product", "Launch holds Aug 15. Infra signoff by EOD."],
        ["Hiring",  "3 senior roles open. JDs due Monday."],
      ].map(([label, body], i) => (
        <div key={label} style={{
          marginBottom: i < 2 ? 10 : 0,
          paddingBottom: i < 2 ? 10 : 0,
          borderBottom: i < 2 ? "1px solid var(--rule-2)" : "none",
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.01em", marginBottom: 3 }}>{label}</div>
          <div style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.5 }}>{body}</div>
        </div>
      ))}
    </CardShell>
  );
}

function ReplyCard() {
  return (
    <CardShell label="drafted · in your voice">
      <div className="mono" style={{ fontSize: 10, color: "var(--paprika)", letterSpacing: "0.08em", marginBottom: 14 }}>
        ◆ SUGGESTIONS
      </div>
      {[
        { txt: "Will get you comments by Wed AM — sync not needed.",       primary: true,  meta: "94% match" },
        { txt: "Tuesday 2:30 works for a 15-min sync.",                    primary: false, meta: "books invite" },
        { txt: "Looks good — only one concern, will leave inline notes.",  primary: false, meta: null },
      ].map((r: any, i: number) => (
        <div key={i} style={{
          padding: "11px 12px",
          border: r.primary ? "1.5px solid var(--ink)" : "1px solid var(--rule)",
          background: r.primary ? "var(--bg-soft)" : "transparent",
          borderRadius: 7,
          marginBottom: 8,
          display: "flex", flexDirection: "column", gap: 5,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <span style={{ fontSize: 12.5, color: "var(--ink)" }}>{r.txt}</span>
            <span className="mono" style={{
              fontSize: 10, color: r.primary ? "var(--paprika)" : "var(--ink-3)",
              letterSpacing: "0.06em", flexShrink: 0,
            }}>{r.primary ? "↵ SEND" : (i + 1)}</span>
          </div>
          {r.meta && (
            <span className="mono" style={{ fontSize: 9.5, color: "var(--ink-3)", letterSpacing: "0.04em" }}>
              {r.meta}
            </span>
          )}
        </div>
      ))}
    </CardShell>
  );
}

function SlotsCard() {
  return (
    <CardShell label="scheduling · david park">
      <div className="mono" style={{ fontSize: 10, color: "var(--paprika)", letterSpacing: "0.08em", marginBottom: 14 }}>
        ◆ MEETING REQUEST DETECTED
      </div>
      <div style={{ fontSize: 12, color: "var(--ink-2)", marginBottom: 12, fontStyle: "italic", lineHeight: 1.45 }}>
        "Can we find 30 minutes this week?"
      </div>
      {[
        { day: "TUE · NOV 11", time: "2:00 – 2:30 PM", picked: false, note: "back-to-back" },
        { day: "WED · NOV 12", time: "3:00 – 3:30 PM", picked: true,  note: "after focus block" },
        { day: "THU · NOV 13", time: "10:00 – 10:30 AM", picked: false, note: "deep work" },
      ].map((s: any, i: number) => (
        <div key={i} style={{
          padding: "8px 12px",
          border: s.picked ? "1.5px solid var(--paprika)" : "1px solid var(--rule)",
          background: s.picked ? "var(--paprika-soft)" : "transparent",
          borderRadius: 7,
          marginBottom: 7,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="mono" style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.04em" }}>{s.day}</span>
              <span style={{ fontSize: 12.5, color: "var(--ink)" }}>{s.time}</span>
            </div>
            <span className="mono" style={{
              fontSize: 9.5, color: s.picked ? "var(--paprika)" : "var(--ink-3)",
              letterSpacing: "0.06em",
            }}>{s.picked ? "→ HOLD" : "OFFER"}</span>
          </div>
          <div className="mono" style={{
            fontSize: 9, color: s.picked ? "var(--paprika)" : "var(--ink-3)",
            letterSpacing: "0.05em", marginTop: 4, opacity: 0.85,
          }}>
            {s.note}
          </div>
        </div>
      ))}

      {/* When-they-pick preview — Bertram's downstream actions */}
      <div style={{
        marginTop: 10, paddingTop: 10,
        borderTop: "1px dashed var(--rule)",
      }}>
        <div className="mono" style={{
          fontSize: 9.5, color: "var(--ink-3)",
          letterSpacing: "0.08em", marginBottom: 6,
        }}>WHEN DAVID PICKS, BERTRAM WILL</div>
        {[
          "Send the calendar invite with Meet link",
          "Draft the agenda from the thread",
          "Block 10 min prep before, 10 min after",
        ].map((t: any, i: number) => (
          <div key={i} style={{
            display: "flex", alignItems: "start", gap: 8,
            fontSize: 11, color: "var(--ink-2)",
            marginBottom: i < 2 ? 4 : 0, lineHeight: 1.45,
          }}>
            <span style={{
              flexShrink: 0, marginTop: 5,
              width: 4, height: 4, borderRadius: "50%",
              background: "var(--paprika)",
            }}/>
            <span>{t}</span>
          </div>
        ))}
      </div>
    </CardShell>
  );
}

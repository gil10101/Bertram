"use client";

// Integrations marquee — slow, infinite, monospace
export function Marquee() {
  const items = [
    "Gmail", "Outlook", "Google Calendar", "iCloud Mail", "Slack",
    "Notion", "Linear", "Zoom", "Microsoft Teams", "HubSpot",
    "Salesforce", "Apple Calendar", "Fastmail", "Calendly", "Asana",
  ];
  return (
    <section id="integrations" style={{
      borderTop: "1px solid var(--rule)",
      borderBottom: "1px solid var(--rule)",
      padding: "44px 0",
      overflow: "hidden",
      position: "relative",
      background: "var(--bg)",
    }}>
      <div className="shell" style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="eyebrow">/ 02 — Integrations</span>
        <span className="eyebrow">14+ services · zero config</span>
      </div>

      <div style={{
        position: "relative",
        maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
      }}>
        <div className="marquee-track" style={{
          display: "flex",
          gap: 0,
          whiteSpace: "nowrap",
          width: "max-content",
          animation: "marquee 48s linear infinite",
        }}>
          {[...items, ...items].map((label: string, i: number) => (
            <MarqueeItem key={i} label={label} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .marquee-track:hover { animation-play-state: paused; }
      `}</style>
    </section>
  );
}

function MarqueeItem({ label }: any) {
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 16,
      paddingRight: 52,
      fontFamily: "var(--font-display)",
      fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
      fontWeight: 400,
      letterSpacing: "-0.025em",
      lineHeight: 1,
      color: "var(--ink-2)",
    }}>
      <span style={{
        flexShrink: 0,
        width: 6, height: 6, borderRadius: "50%",
        background: "var(--ink-3)", opacity: 0.6,
        transform: "translateY(-0.08em)",
      }}></span>
      {label}
    </span>
  );
}

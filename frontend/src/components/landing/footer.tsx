"use client";

// Footer — CTA lives in the Hero; this is just the editorial footer.

import Link from "next/link";

type FooterLink = { label: string; href: string; internal?: boolean };

const FOOTER_COLS: { h: string; links: FooterLink[] }[] = [
  {
    h: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Integrations", href: "#integrations" },
      { label: "About", href: "#top" },
    ],
  },
  {
    h: "Resources",
    links: [
      { label: "Docs", href: "/docs", internal: true },
      { label: "Privacy", href: "/privacy", internal: true },
      { label: "Terms", href: "/terms", internal: true },
    ],
  },
];

export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--rule)",
        padding: "60px 0 40px",
        background: "var(--bg)",
        position: "relative",
        overflow: "visible",
      }}
    >
      {/* Grid background — grows from the bottom of the 04 visual into the footer */}
      <FooterGrid />

      <div className="shell" style={{ position: "relative", zIndex: 2 }}>
        {/* Top row */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: 40, paddingBottom: 60 }}
          className="footer-cols"
        >
          <div>
            <div style={{ display: "inline-flex", alignItems: "center" }}>
              <span style={{ fontSize: 18, fontWeight: 500, letterSpacing: "-0.02em" }}>Bertram</span>
            </div>
            <p style={{ marginTop: 14, fontSize: 13, color: "var(--ink-2)", maxWidth: "28ch", lineHeight: 1.55 }}>
              An AI email client for people who&rsquo;d rather be doing anything else.
            </p>
          </div>

          {FOOTER_COLS.map((col) => (
            <div key={col.h}>
              <div
                className="mono"
                style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.1em", marginBottom: 14, textTransform: "uppercase" }}
              >
                {col.h}
              </div>
              {col.links.map((l) =>
                l.internal ? (
                  <Link
                    key={l.label}
                    href={l.href}
                    style={{ display: "block", fontSize: 13, color: "var(--ink-2)", padding: "5px 0", transition: "color .2s ease" }}
                    onMouseEnter={(e: any) => (e.currentTarget.style.color = "var(--ink)")}
                    onMouseLeave={(e: any) => (e.currentTarget.style.color = "var(--ink-2)")}
                  >
                    {l.label}
                  </Link>
                ) : (
                  <a
                    key={l.label}
                    href={l.href}
                    style={{ display: "block", fontSize: 13, color: "var(--ink-2)", padding: "5px 0", transition: "color .2s ease" }}
                    onMouseEnter={(e: any) => (e.currentTarget.style.color = "var(--ink)")}
                    onMouseLeave={(e: any) => (e.currentTarget.style.color = "var(--ink-2)")}
                  >
                    {l.label}
                  </a>
                )
              )}
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div
          style={{
            borderTop: "1px solid var(--rule)",
            paddingTop: 22,
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)", letterSpacing: "0.05em" }}>
            © 2026 BERTRAM LABS, INC.
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 760px) {
          .footer-cols { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .footer-cols { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}

function FooterGrid() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: -260,
        bottom: 0,
        pointerEvents: "none",
        zIndex: 1,
        backgroundImage: `
          repeating-linear-gradient(to right,  var(--grid-line) 0 1px, transparent 1px 80px),
          repeating-linear-gradient(to bottom, var(--grid-line) 0 1px, transparent 1px 80px)
        `,
        backgroundPosition: "center top",
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 30%, #000 60%, #000 100%)",
        maskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 30%, #000 60%, #000 100%)",
      }}
    />
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BertramMark } from "./icons";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#product", label: "Product" },
  { href: "#integrations", label: "Integrations" },
];

export function Nav({ isSignedIn = false }: { isSignedIn?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transition: "background-color .45s ease, backdrop-filter .45s ease, border-color .45s ease",
        backgroundColor: scrolled ? "color-mix(in oklab, var(--bg) 78%, transparent)" : "transparent",
        backdropFilter: scrolled ? "blur(14px) saturate(140%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(14px) saturate(140%)" : "none",
        borderBottom: scrolled ? "1px solid var(--rule)" : "1px solid transparent",
      }}
    >
      <div
        className="shell"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}
      >
        <a href="#top" style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          <BertramMark size={18} />
          <span style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 500, letterSpacing: "-0.02em" }}>
            Bertram
          </span>
        </a>

        <div style={{ display: "flex", alignItems: "center", gap: 32 }} className="nav-links">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="mono"
              style={{ fontSize: 12, color: "var(--ink-2)", letterSpacing: "0.02em", transition: "color .25s ease" }}
              onMouseEnter={(e: any) => (e.currentTarget.style.color = "var(--ink)")}
              onMouseLeave={(e: any) => (e.currentTarget.style.color = "var(--ink-2)")}
            >
              {l.label}
            </a>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, whiteSpace: "nowrap" }}>
          <Link
            href={isSignedIn ? "/inbox" : "/sign-up"}
            className="btn btn-primary"
            style={{ padding: "8px 14px", fontSize: 13, whiteSpace: "nowrap" }}
          >
            {isSignedIn ? "Dashboard" : "Get Bertram"}
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 760px) {
          .nav-links { display: none !important; }
        }
      `}</style>
    </nav>
  );
}

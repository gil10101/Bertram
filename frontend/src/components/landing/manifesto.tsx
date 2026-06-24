"use client";

// Manifesto — scroll-driven letter-by-letter reveal.
// Letters start blank. As the section scrolls into view, each letter
// fades in and drops ~5px to its final position.

import { useRef, useState, useEffect } from "react";

export function Manifesto() {
  const ref = useRef<any>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf: any;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // Start: top of section at 35% viewport (near middle). End: top at -10% (just past top edge).
      const start = vh * 0.35;
      const end   = vh * -0.10;
      const p = (start - rect.top) / (start - end);
      setProgress(Math.max(0, Math.min(1, p)));
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

  const lead = "We built Bertram because we were tired of email running our lives.";
  const tail = "Now it runs itself.";

  // Count total letters (no spaces) to slot each one along [0, 1]
  const totalLetters = (lead + tail).replace(/\s/g, "").length;

  // Each letter reveals over a slice of progress; the slice is wider than 1/N
  // so adjacent letters overlap a bit (feels smooth, not staccato).
  const LETTER_WINDOW = 0.18;

  let counter = 0;

  const renderText = (text: string, italic: boolean) => {
    return text.split(" ").map((word: string, wi: number, arr: string[]) => (
      <span key={wi} style={{ display: "inline-block", whiteSpace: "nowrap" }}>
        {[...word].map((ch: string, ci: number) => {
          const idx = counter++;
          const startP = (idx / totalLetters) * (1 - LETTER_WINDOW);
          const endP   = startP + LETTER_WINDOW;
          const local  = (progress - startP) / (endP - startP);
          const t = Math.max(0, Math.min(1, local));
          // Ease-out
          const eased = 1 - Math.pow(1 - t, 3);
          return (
            <span key={ci} style={{
              display: "inline-block",
              color: italic ? "var(--paprika)" : "var(--ink)",
              fontStyle: italic ? "italic" : "normal",
              fontWeight: italic ? 400 : "inherit",
              opacity: eased,
              transform: `translateY(${(1 - eased) * -5}px)`,
              willChange: "opacity, transform",
            }}>{ch}</span>
          );
        })}
        {wi < arr.length - 1 && (
          <span style={{ display: "inline-block", width: "0.28em" }}>&nbsp;</span>
        )}
      </span>
    ));
  };

  return (
    <section ref={ref} className="manifesto-section" style={{
      position: "relative",
      padding: "180px 0 200px",
      background: "var(--bg)",
      borderBottom: "1px solid var(--rule)",
    }}>
      <div className="shell" style={{ maxWidth: 1100 }}>
        <div className="eyebrow" style={{ marginBottom: 32, textAlign: "center" }}>/ Why Bertram</div>
        <h2 className="h-display" style={{
          fontSize: "clamp(2.4rem, 5.6vw, 4.8rem)",
          lineHeight: 1.06,
          letterSpacing: "-0.04em",
          maxWidth: "22ch",
          margin: "0 auto",
          textAlign: "center",
        }}>
          {renderText(lead, false)}
          <br/>
          {renderText(tail, true)}
        </h2>
      </div>
    </section>
  );
}

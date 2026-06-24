"use client";

// Product section (04) — Bertram inbox UI, matches the Bertram inbox
// 1% diff: word-by-word AI summary generation + "Drafts in your voice" composer
// for the Reply tab. Everything else mirrors the codebase exactly.

import { useState, useEffect, useRef, Fragment } from "react";
import { Icon, BRAND_ICONS } from "./icons";
import { CalendarPane } from "./calendar";

const TABS = [
  { key: "read",     label: "Read",     hotkey: "1" },
  { key: "reply",    label: "Reply",    hotkey: "2" },
  { key: "schedule", label: "Schedule", hotkey: "3" },
];

export function BertramDemo({ onViewChange, controls = true }: any) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [view, setView] = useState("inbox"); // "inbox" | "calendar"
  const [scrolled, setScrolled] = useState(false);       // Sarah pane scrolled to drafts
  const [replyStage, setReplyStage] = useState("idle");  // idle | open | sent
  const [holdStage, setHoldStage] = useState("idle");    // idle | holding | held
  const [meetingSel, setMeetingSel] = useState<any>(null);    // calendar: which meeting is open
  const [calScroll, setCalScroll] = useState<any>(null);      // calendar: scroll a meeting up into frame
  const [cycleId, setCycleId] = useState(0);
  const [cursor, setCursor] = useState<any>(null);            // { sel, action, key }
  const [inView, setInView] = useState(false);
  const [cursorOn, setCursorOn] = useState(false);       // desktop + motion welcome
  const rootRef = useRef<any>(null);
  const inboxRef = useRef<any>(null);
  const cursorKey = useRef<number>(0);

  // Report inbox/calendar view up so a parent (e.g. the section heading) can react.
  useEffect(() => { if (onViewChange) onViewChange(view); }, [view]);

  // Gate the demo on visibility — geometry-based so it starts reliably even
  // when the IntersectionObserver's initial callback is delayed/missing.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const compute = () => {
      const r = el.getBoundingClientRect();
      const vis = r.top < window.innerHeight && r.bottom > 0;
      setInView(vis);
    };
    const io = new IntersectionObserver(() => compute(), { threshold: [0, 0.2] });
    io.observe(el);
    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, []);

  // The pointer only appears on roomy viewports + when motion is welcome.
  // (On smaller screens the demo still plays itself, just without the cursor.)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const check = () => setCursorOn(window.innerWidth > 880 && !mq.matches);
    check();
    window.addEventListener("resize", check);
    mq.addEventListener && mq.addEventListener("change", check);
    return () => {
      window.removeEventListener("resize", check);
      mq.removeEventListener && mq.removeEventListener("change", check);
    };
  }, []);

  // Manual hotkeys 1–3
  useEffect(() => {
    const onKey = (e: any) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= TABS.length) { setActive(n - 1); setPaused(true); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ── Master choreography ──────────────────────────────
  // The cursor works one real thread end-to-end, then follows it into the
  // calendar — every visible change is something "it" just did: open Sarah →
  // read/scroll → pick a suggested reply (composer opens, sends) → open David
  // → press-and-hold a slot (it fills + books) → open the Meetings tab (the
  // new 1:1 animates in) → click through each meeting. Loops. Pausing hands
  // control back.
  useEffect(() => {
    if (paused || !inView) return;
    let stopped = false;
    const timers: any[] = [];
    const wait = (ms: number) => new Promise<void>(res => {
      const id = setTimeout(() => { if (!stopped) res(); }, ms);
      timers.push(id);
    });
    const point = (sel: string, action: string) => setCursor({ sel, action, key: ++cursorKey.current });
    const scrollMeeting = (k: string) => setCalScroll({ k, key: ++cursorKey.current });

    (async () => {
      while (!stopped) {
        // ── READ ── reach for Sarah's row and click BEFORE the content switches
        setView("inbox"); setScrolled(false); setReplyStage("idle");
        point('[data-thread-key="sarah"]', "click");   // move to Sarah's thread
        await wait(1080);                               // let the click land first
        setActive(0); setHoldStage("idle"); setMeetingSel(null); setCycleId(c => c + 1); // now open it
        await wait(760);
        point('[data-cursor="thread-body"]', "move");  // move into the message
        await wait(520);
        setScrolled(true);                              // scroll down through it
        await wait(2100);
        if (stopped) break;

        // ── REPLY ──
        setActive(1);
        point('[data-cursor="draft-primary"]', "click"); // pick a suggested reply
        await wait(1150);
        setReplyStage("open");                            // composer opens, types in
        await wait(2600);
        point('[data-cursor="reply-send"]', "click");    // send it
        await wait(980);
        setReplyStage("sent");
        await wait(1850);
        if (stopped) break;

        // ── SCHEDULE ──
        setReplyStage("idle");
        point('[data-thread-key="david"]', "click");     // open David's thread
        await wait(880);
        setActive(2);                                     // content changes
        await wait(1500);
        point('[data-cursor="slot-mid"]', "hold");       // press-and-hold a slot
        await wait(900);
        setHoldStage("holding");                          // it fills
        await wait(1350);
        setHoldStage("held");                             // booked
        await wait(1900);
        if (stopped) break;

        // ── MEETINGS ── follow the booking into the calendar
        point('[data-cursor="nav-meetings"]', "click");  // reach for the Meetings tab
        await wait(1120);
        setView("calendar"); setMeetingSel(null);         // calendar opens; the new 1:1 animates in
        await wait(2600);                                 // watch it get created
        point('[data-cursor="meeting-q3"]', "click");     // open Q3 Planning
        await wait(1050);
        setMeetingSel("q3");
        await wait(2300);
        scrollMeeting("marketing");                        // bring Marketing kickoff up into frame
        await wait(720);
        point('[data-cursor="meeting-marketing"]', "click"); // open Marketing kickoff
        await wait(1050);
        setMeetingSel("marketing");
        await wait(2300);
        scrollMeeting("david");                            // bring the new 1:1 up into frame
        await wait(720);
        point('[data-cursor="meeting-david"]', "click");  // open the brand-new 1:1 with David
        await wait(1050);
        setMeetingSel("david");
        await wait(2800);
        if (stopped) break;

        // head back to the inbox and run it again
        point('[data-cursor="nav-inbox"]', "click");
        await wait(1080);
        setView("inbox");
        await wait(650);
      }
    })();

    return () => { stopped = true; timers.forEach(clearTimeout); };
  }, [paused, inView]);

  const pickTab = (i: number) => { setActive(i); setPaused(true); };

  return (
    <div ref={rootRef} className="shell product-inbox-wrap" style={{ maxWidth: 1280 }}>
        <div className="product-tabs" style={{
          display: controls && view === "inbox" ? "flex" : "none",
          justifyContent: "center", gap: 8,
          marginBottom: 22, flexWrap: "wrap",
        }}>
          {TABS.map((tab, i) => {
            const isActive = i === active;
            return (
              <button
                key={tab.key}
                data-tab={tab.key}
                onClick={() => pickTab(i)}
                onMouseEnter={() => setPaused(true)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  padding: "10px 18px",
                  borderRadius: 999,
                  border: isActive ? "1px solid var(--ink)" : "1px solid var(--rule)",
                  background: isActive ? "var(--ink)" : "transparent",
                  color: isActive ? "var(--bg)" : "var(--ink-2)",
                  fontFamily: "var(--font-display)",
                  fontSize: 13.5,
                  fontWeight: 500,
                  letterSpacing: "-0.01em",
                  transition: "background .35s ease, color .35s ease, border-color .35s ease",
                }}
              >
                <span>{tab.label}</span>
                <span className="mono" style={{
                  fontSize: 10,
                  padding: "2px 6px",
                  borderRadius: 4,
                  background: isActive ? "rgba(255,255,255,0.15)" : "var(--chip-bg)",
                  color: isActive ? "var(--bg)" : "var(--ink-3)",
                  letterSpacing: "0.04em",
                }}>{tab.hotkey}</span>
              </button>
            );
          })}
        </div>

        <div className="product-cycle-row" style={{
          display: controls && view === "inbox" ? "flex" : "none",
          justifyContent: "center", alignItems: "center", gap: 10,
          marginBottom: 28,
          opacity: paused ? 0.4 : 1,
          transition: "opacity .3s ease",
        }}>
          <span className="mono" style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.06em" }}>
            {paused ? "MANUAL · 1–3 OR TAB ABOVE" : "AUTO ·"}
          </span>
          {!paused && <CycleBar />}
          {paused && (
            <button
              onClick={() => setPaused(false)}
              className="mono"
              style={{
                fontSize: 10, color: "var(--paprika)", letterSpacing: "0.06em",
                textDecoration: "underline", textUnderlineOffset: 3,
              }}
            >RESUME</button>
          )}
        </div>

        {controls && view !== "inbox" && <div style={{ height: 28 }} />}
        <BertramInbox
          active={active}
          cycleId={cycleId}
          view={view}
          onView={(v: any) => { setView(v); setPaused(true); }}
          interactive
          scrolled={scrolled}
          replyStage={replyStage}
          holdStage={holdStage}
          calSelected={meetingSel}
          calScroll={calScroll}
          onCalSelect={(k: any) => { setMeetingSel(k); setPaused(true); }}
          stageRef={inboxRef}
          cursorOverlay={
            cursorOn && !paused
              ? <CinematicCursor stageRef={inboxRef} cursor={cursor} />
              : null
          }
        />
      </div>
  );
}

export function Product() {
  const [view, setView] = useState("inbox");
  return (
    <section id="product" className="product-section" style={{
      position: "relative",
      paddingTop: 140,
      paddingBottom: 160,
      background: "var(--bg)",
    }}>
      <div className="shell" style={{ marginBottom: 48, textAlign: "center" }}>
        <div className="eyebrow product-eyebrow" style={{ marginBottom: 22 }}>/ 04 — In motion</div>
        <h2 className="h-display product-headline" style={{
          fontSize: "clamp(2.4rem, 5.4vw, 4.6rem)",
          maxWidth: "20ch",
          margin: "0 auto",
          letterSpacing: "-0.04em",
        }}>
          {view === "calendar"
            ? <>A calendar that <span style={{ fontStyle: "italic", color: "var(--ink-2)", fontWeight: 400 }}>prepares</span> you.</>
            : <>Watch Bertram <span style={{ fontStyle: "italic", color: "var(--ink-2)", fontWeight: 400 }}>handle</span> a thread.</>}
        </h2>
        <p className="lede product-lede" style={{ margin: "20px auto 0", textAlign: "center" }}>
          {view === "calendar"
            ? "Every meeting arrives with the thread that started it, the docs you need, and time blocked to prep. Click Inbox in the sidebar to head back."
            : "Pick an action — or just watch. Bertram works through every thread the same way: read, decide, do."}
        </p>
      </div>

      <BertramDemo onViewChange={setView} />
    </section>
  );
}

function CycleBar() {
  return (
    <span style={{
      display: "inline-block", width: 72, height: 2,
      background: "var(--rule)", borderRadius: 2, overflow: "hidden",
    }}>
      <span style={{
        display: "block", height: 2, width: "42%",
        background: "var(--paprika)", borderRadius: 2,
        animation: "cycleSlide 1.8s ease-in-out infinite",
      }}></span>
      <style>{`@keyframes cycleSlide { 0% { transform: translateX(-115%); } 100% { transform: translateX(285%); } }`}</style>
    </span>
  );
}

/* ─────────────── CINEMATIC CURSOR (04) ───────────────
   A scripted pointer that lives INSIDE the inbox container and is
   driven by Product's choreography: it glides to a target, then
   clicks (quick press + ripple) or holds (long press, for the
   press-and-hold meeting booking). It is clamped to the container
   so it never leaves the app. pointer-events:none — never blocks
   real input. Clean filled arrowhead, NO stem (Lucide mouse-pointer-2). */
function CinematicCursor({ stageRef, cursor }: any) {
  const [pos, setPos] = useState({ x: 120, y: 120 });
  const [pressed, setPressed] = useState(false);
  const [rippleKey, setRippleKey] = useState(0);

  useEffect(() => {
    if (!cursor) return;
    const stage = stageRef && stageRef.current;
    if (!stage) return;
    let raf = 0, t1: any = 0, t2: any = 0;
    // Measure after a frame so a freshly-rendered target is in place
    raf = requestAnimationFrame(() => {
      const el = stage.querySelector(cursor.sel);
      if (!el) return;
      const s = stage.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      setPos({
        x: Math.max(10, Math.min(s.width - 10, r.left - s.left + r.width / 2)),
        y: Math.max(10, Math.min(s.height - 10, r.top - s.top + r.height / 2)),
      });
    });
    if (cursor.action === "click" || cursor.action === "hold") {
      const holdFor = cursor.action === "hold" ? 1300 : 200;
      t1 = setTimeout(() => {
        setPressed(true);
        setRippleKey(k => k + 1);
        t2 = setTimeout(() => setPressed(false), holdFor);
      }, 880); // after the glide settles
    }
    return () => { cancelAnimationFrame(raf); clearTimeout(t1); clearTimeout(t2); };
  }, [cursor && cursor.key]);

  return (
    <div aria-hidden="true" style={{
      position: "absolute", left: 0, top: 0,
      transform: `translate(${pos.x}px, ${pos.y}px)`,
      transition: "transform 0.8s cubic-bezier(.45,.05,.18,1)",
      pointerEvents: "none", zIndex: 20, willChange: "transform",
    }}>
      {rippleKey > 0 && (
        <span key={rippleKey} style={{
          position: "absolute", left: -4, top: -3,
          width: 26, height: 26, borderRadius: "50%",
          border: "2px solid var(--paprika)", pointerEvents: "none",
          animation: "cursorClick 0.6s cubic-bezier(.22,.61,.36,1) forwards",
        }} />
      )}
      <svg width="24" height="24" viewBox="0 0 24 24" style={{
        display: "block", marginLeft: -4, marginTop: -3,
        filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.4))",
        transform: pressed ? "scale(0.8)" : "scale(1)",
        transformOrigin: "5px 5px",
        transition: "transform 0.16s ease",
      }}>
        <path
          d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z"
          fill="var(--ink)" stroke="var(--bg)" strokeWidth="1.3" strokeLinejoin="round"
        />
      </svg>
      <style>{`
        @keyframes cursorClick {
          0%   { transform: scale(0.45); opacity: 0.85; }
          100% { transform: scale(1.9);  opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   BertramInbox — mirrors landing-v2/inbox-mockup.tsx layout exactly
   ════════════════════════════════════════════════════════════════ */

function BertramInbox({ active, cycleId = 0, view = "inbox", onView = () => {}, interactive = false, scrolled = false, replyStage = "idle", holdStage = "idle", calSelected = null, calScroll = null, onCalSelect = () => {}, stageRef = null, cursorOverlay = null }: any) {
  return (
    <div ref={stageRef} style={{
      position: "relative",
      borderRadius: 14,
      overflow: "hidden",
      boxShadow: "0 60px 100px -50px rgba(0,0,0,0.22), 0 8px 20px -10px rgba(0,0,0,0.1)",
      border: "1px solid var(--rule)",
    }}>
      <div className="inbox-grid" style={{
        display: "flex",
        background: "var(--inbox-sidebar)",
        height: 760,
        overflow: "hidden",
      }}>
        <Sidebar view={view} onView={onView} interactive={interactive} />

        {/* Main area: gap-[2px] py-1 pr-1 (small 2px gap between list + detail, slight breathing) */}
        <div className="inbox-main" style={{
          display: "flex", gap: 2,
          padding: "4px 4px 4px 0",
          flex: 1, minWidth: 0,
        }}>
          {view === "calendar" ? (
            <CalendarPane selected={calSelected} onSelect={onCalSelect} scrollReq={calScroll} />
          ) : (
            <>
              <ThreadList active={active} />
              <div style={{
                display: "flex", flex: 1, minWidth: 0,
                borderRadius: 8,
                overflow: "hidden",
                background: "var(--inbox-bg)",
                position: "relative",
              }}>
                <ThreadPane active={active} cycleId={cycleId} scrolled={scrolled} replyStage={replyStage} holdStage={holdStage} />
              </div>
            </>
          )}
        </div>
      </div>

      {cursorOverlay}

      <style>{`
        @media (max-width: 1100px) {
          .inbox-grid > aside { width: 140px !important; }
          .inbox-main .thread-list-col { width: 200px !important; }
        }
        @media (max-width: 880px) {
          .inbox-grid > aside { display: none !important; }
        }
        @media (max-width: 720px) {
          .inbox-main .thread-list-col { display: none !important; }
        }
      `}</style>
    </div>
  );
}

/* ─────────────── SIDEBAR ─────────────── */

function Sidebar({ view = "inbox", onView = () => {}, interactive = false }: any) {
  const coreNav = [
    { icon: "inbox",  label: "Inbox",    count: 24, active: view === "inbox",    dashed: interactive && view !== "inbox",    onClick: interactive ? () => onView("inbox")    : undefined, cursorId: "nav-inbox" },
    { icon: "star",   label: "Favorites", count: 3 },
    { icon: "draft",  label: "Drafts",   count: 2 },
    { icon: "send",   label: "Sent" },
    { icon: "cal",    label: "Meetings", count: 5, active: view === "calendar", dashed: interactive && view !== "calendar", onClick: interactive ? () => onView("calendar") : undefined, cursorId: "nav-meetings" },
  ];
  const mgmt = [
    { icon: "archive", label: "Archive" },
    { icon: "spam",    label: "Spam" },
    { icon: "trash",   label: "Bin" },
  ];
  const bottom = [
    { icon: "gear", label: "Settings" },
    { icon: "help", label: "Support" },
  ];

  return (
    <aside style={{
      width: 180,
      flexShrink: 0,
      display: "flex", flexDirection: "column",
      background: "var(--inbox-sidebar)",
      padding: "12px 6px 8px",
    }}>
      {/* Account */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 8px 10px" }}>
        <div style={{
          width: 24, height: 24, borderRadius: "50%",
          background: "rgba(235,94,40,0.2)", color: "var(--paprika)",
          fontSize: 11, fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>A</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--inbox-fg)", letterSpacing: "-0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            Alex Johnson
          </div>
          <div style={{ fontSize: 9.5, color: "var(--inbox-faint)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 1 }}>
            alex@company.com
          </div>
        </div>
      </div>

      {/* New email button */}
      <div style={{ padding: "0 6px 6px" }}>
        <button style={{
          width: "100%",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          padding: "7px 10px",
          borderRadius: 6,
          background: "var(--inbox-fg)",
          color: "var(--inbox-sidebar)",
          fontSize: 11.5, fontWeight: 600, letterSpacing: "-0.01em",
        }}>
          <Icon name="mail" size={12} />
          New email
        </button>
      </div>

      {/* CORE */}
      <div style={{ flex: 1, padding: "4px 4px", overflow: "hidden" }}>
        <SidebarLabel>Core</SidebarLabel>
        {coreNav.map((it: any) => <NavItem key={it.label} {...it} />)}

        <SidebarLabel marginTop={12}>Management</SidebarLabel>
        {mgmt.map((it: any) => <NavItem key={it.label} {...it} />)}
      </div>

      {/* Bottom: settings + support */}
      <div style={{ padding: "4px" }}>
        {bottom.map((it: any) => <NavItem key={it.label} {...it} />)}
      </div>
    </aside>
  );
}

function SidebarLabel({ children, marginTop = 0 }: any) {
  return (
    <div style={{
      padding: "6px 8px 2px",
      marginTop,
      fontSize: 8.5,
      fontWeight: 600,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "var(--inbox-faint)",
    }}>
      {children}
    </div>
  );
}

function NavItem({ icon, label, count, active, dashed, onClick, cursorId }: any) {
  return (
    <div onClick={onClick} data-cursor={cursorId} style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "4px 7px",
      borderRadius: 6,
      background: active ? "var(--inbox-accent)" : "transparent",
      color: active ? "var(--inbox-fg)" : "var(--inbox-muted)",
      fontSize: 11.5,
      fontWeight: active ? 500 : 400,
      letterSpacing: "-0.005em",
      marginBottom: 1,
      border: dashed && !active
        ? "1px dashed color-mix(in oklab, var(--inbox-fg) 30%, transparent)"
        : "1px solid transparent",
      cursor: onClick ? "pointer" : "default",
      transition: "background .2s ease, border-color .2s ease",
    }}>
      <Icon name={icon} size={12} />
      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
      {count != null && (
        <span style={{ marginLeft: "auto", fontSize: 9.5, color: "var(--inbox-faint)" }}>{count}</span>
      )}
    </div>
  );
}

/* ─────────────── THREAD LIST ─────────────── */

const ALL_THREADS = {
  pinned: [
    { k: "sarah",  initial: "S", c: "#eb5e28", sender: "Sarah Chen",   subject: "Q3 Planning — Action items from today's call", time: "2m",  unread: true, priority: "high", threadCount: 4 },
    { k: "rivera", initial: "A", c: "#f59e0b", sender: "Alex Rivera",  subject: "Contract review — needs signature by Friday",   time: "45m", unread: true, priority: "high", label: "important", threadCount: 2 },
  ],
  primary: [
    { k: "linear", brand: "Linear",       sender: "Linear",       subject: "3 issues assigned to you",            time: "15m", unread: true,  label: "updates" },
    { k: "david",  initial: "D", c: "#10b981", sender: "David Park",   subject: "Re: Can we move Thursday's standup?", time: "1h",  unread: false, threadCount: 5 },
    { k: "figma",  brand: "Figma",        sender: "Figma",        subject: "You were mentioned in Brand System v2", time: "2h", unread: false, label: "social" },
    { k: "maria",  initial: "M", c: "#f43f5e", sender: "Maria Lopez",  subject: "Updated wireframes for onboarding flow", time: "2h", unread: false, priority: "medium", threadCount: 3 },
    { k: "stripe", brand: "Stripe",       sender: "Stripe",       subject: "Payment received — $2,400.00",        time: "3h", unread: false },
    { k: "james",  initial: "J", c: "#14b8a6", sender: "James Wu",     subject: "Re: API rate limiting — prod incident follow-up", time: "3h", unread: false, priority: "high", threadCount: 8 },
    { k: "notion", brand: "Notion",       sender: "Notion",       subject: "Weekly digest: 12 pages updated",     time: "4h", unread: false, label: "updates" },
    { k: "rachel", initial: "R", c: "#06b6d4", sender: "Rachel Kim",   subject: "Lunch tomorrow? That new place on Market", time: "5h", unread: false, label: "social", threadCount: 3 },
    { k: "github", brand: "GitHub",       sender: "GitHub",       subject: "[bertram-app] PR #247 merged",        time: "5h", unread: false },
    { k: "tom",    initial: "T", c: "#8b5cf6", sender: "Tom Bradley",  subject: "Re: Budget approval for Q3 marketing", time: "6h", unread: false, priority: "medium", label: "important", threadCount: 6 },
  ],
};

function ThreadList({ active }: any) {
  const selectedKey = active === 2 ? "david" : "sarah";

  return (
    <div className="thread-list-col" style={{
      width: 250,
      flexShrink: 0,
      borderRadius: 8,
      overflow: "hidden",
      background: "var(--inbox-bg)",
      display: "flex", flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", padding: "10px 14px 6px",
      }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--inbox-fg)", letterSpacing: "-0.01em" }}>Inbox</span>
        <span style={{
          marginLeft: "auto",
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "2px 8px", borderRadius: 6,
          fontSize: 10.5, color: "var(--inbox-muted)",
        }}>
          <Icon name="check" size={11} />
          Select
        </span>
      </div>

      {/* Search */}
      <div style={{ padding: "0 10px 6px" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 10px",
          borderRadius: 6,
          border: "1px solid var(--inbox-border)",
          background: "var(--inbox-card)",
        }}>
          <Icon name="search" size={11} color="var(--inbox-faint)" />
          <span style={{ flex: 1, fontSize: 10.5, color: "var(--inbox-faint)" }}>Search</span>
          <span style={{
            padding: "1px 5px", borderRadius: 3,
            background: "var(--inbox-accent)",
            fontFamily: "var(--font-mono)",
            fontSize: 9.5, color: "var(--inbox-faint)",
          }}>⌘K</span>
        </div>
      </div>

      {/* PINNED */}
      <ListGroup label="PINNED" count={ALL_THREADS.pinned.length}>
        {ALL_THREADS.pinned.map((t: any, i: number) => (
          <EmailRow key={t.k} t={t} isLast={i === ALL_THREADS.pinned.length - 1} selected={t.k === selectedKey} />
        ))}
      </ListGroup>

      {/* PRIMARY */}
      <ListGroup label="PRIMARY" count={ALL_THREADS.primary.length}>
        <div style={{ flex: 1, overflow: "hidden" }}>
          {ALL_THREADS.primary.map((t: any, i: number) => (
            <EmailRow key={t.k} t={t} isLast={i === ALL_THREADS.primary.length - 1} selected={t.k === selectedKey} />
          ))}
        </div>
      </ListGroup>

      {/* Pagination footer */}
      <div style={{
        padding: "6px 14px",
        borderTop: "1px solid var(--inbox-border)",
        display: "flex", alignItems: "center",
      }}>
        <span style={{ fontSize: 9.5, color: "var(--inbox-faint)" }}>
          1–{ALL_THREADS.pinned.length + ALL_THREADS.primary.length}
        </span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 4, color: "var(--inbox-muted)" }}>
          <Icon name="chev-left"  size={11} />
          <Icon name="chev-right" size={11} />
        </div>
      </div>
    </div>
  );
}

function ListGroup({ label, count, children }: any) {
  return (
    <>
      <div style={{
        display: "flex", alignItems: "center",
        padding: "8px 14px 2px",
      }}>
        <span style={{
          fontSize: 8.5, fontWeight: 600,
          letterSpacing: "0.12em", textTransform: "uppercase",
          color: "var(--inbox-faint)",
        }}>{label}</span>
        <span style={{ marginLeft: "auto", fontSize: 9, color: "var(--inbox-faint)" }}>[{count}]</span>
      </div>
      {children}
    </>
  );
}

function EmailRow({ t, isLast, selected }: any) {
  return (
    <div data-thread-key={t.k} style={{
      display: "flex", gap: 8, padding: "6px 12px",
      alignItems: "start",
      background: selected ? "var(--inbox-accent)" : "transparent",
      borderLeft: selected ? "2px solid var(--paprika)" : "2px solid transparent",
      borderBottom: !isLast ? "1px solid color-mix(in oklab, var(--inbox-border) 50%, transparent)" : "none",
      transition: "background .35s ease, border-color .35s ease",
    }}>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <Avatar t={t} />
        {t.unread && (
          <span style={{
            position: "absolute", top: -1, right: -1,
            width: 6, height: 6, borderRadius: "50%",
            background: "var(--paprika)",
          }}></span>
        )}
      </div>

      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{
            fontSize: 11.5,
            fontWeight: t.unread ? 700 : 500,
            color: t.unread ? "var(--inbox-fg)" : "color-mix(in oklab, var(--inbox-fg) 70%, transparent)",
            letterSpacing: "-0.01em",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>{t.sender}</span>
          {t.threadCount && t.threadCount > 1 && (
            <span style={{ flexShrink: 0, fontSize: 9, color: "var(--inbox-faint)" }}>[{t.threadCount}]</span>
          )}
        </div>
        <span style={{
          display: "block",
          fontSize: 10.5, color: "color-mix(in oklab, var(--inbox-muted) 70%, transparent)",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          marginTop: 1,
        }}>{t.subject}</span>
      </div>

      <div style={{
        flexShrink: 0,
        display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2,
      }}>
        <span style={{ fontSize: 9, color: "var(--inbox-faint)" }}>{t.time}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          {t.priority && <PriorityDot kind={t.priority} />}
          {t.label && <LabelIcon kind={t.label} />}
        </div>
      </div>
    </div>
  );
}

function Avatar({ t }: any) {
  const brand = BRAND_ICONS[t.brand];
  if (brand) {
    const BIcon = brand.icon;
    return (
      <div style={{
        width: 24, height: 24, borderRadius: "50%",
        background: brand.bg,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <BIcon size={12} color={brand.fg} />
      </div>
    );
  }
  return (
    <div style={{
      width: 24, height: 24, borderRadius: "50%",
      background: t.c + "33",   // 20% alpha
      color: t.c,
      fontSize: 10, fontWeight: 600,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--font-mono)",
    }}>{t.initial}</div>
  );
}

function PriorityDot({ kind }: any) {
  const map: any = { high: "#ef4444", medium: "#fbbf24", low: "#22c55e" };
  return (
    <span style={{
      width: 6, height: 6, borderRadius: "50%",
      background: map[kind] || "#ccc",
    }}></span>
  );
}

function LabelIcon({ kind }: any) {
  const cfg = {
    important: { icon: "bolt", color: "#f59e0b" },
    updates:   { icon: "bell", color: "#8b5cf6" },
    social:    { icon: "people", color: "#2563eb" },
  }[kind as string];
  if (!cfg) return null;
  return <Icon name={cfg.icon} size={10} color={cfg.color} />;
}

/* ─────────────── THREAD PANE — crossfade between Sarah & David ─────────────── */

function ThreadPane({ active, cycleId = 0, scrolled = false, replyStage = "idle", holdStage = "idle" }: any) {
  const showDavid = active === 2;
  return (
    <>
      <ThreadCrossfadeLayer visible={!showDavid}>
        <SarahQ3Thread active={active} cycleId={cycleId} scrolled={scrolled} replyStage={replyStage} />
      </ThreadCrossfadeLayer>
      <ThreadCrossfadeLayer visible={showDavid}>
        <DavidScheduleThread holdStage={holdStage} />
      </ThreadCrossfadeLayer>
    </>
  );
}

function ThreadCrossfadeLayer({ visible, children }: any) {
  return (
    <div style={{
      position: "absolute",
      inset: 0,
      overflow: "hidden",
      opacity: visible ? 1 : 0,
      transform: visible ? "scale(1)" : "scale(0.985)",
      filter: visible ? "blur(0)" : "blur(4px)",
      transition: "opacity .45s ease, transform .55s cubic-bezier(.22,.61,.36,1), filter .45s ease",
      pointerEvents: visible ? "auto" : "none",
      willChange: "opacity, transform, filter",
    }}>
      {children}
    </div>
  );
}

/* ─────────────── SARAH Q3 THREAD ─────────────── */

function SarahQ3Thread({ active, cycleId = 0, scrolled = false, replyStage = "idle" }: any) {
  // Scroll the body down to bring the AI drafts into view (during the read beat,
  // or whenever the Reply tab is active in the passive hero preview).
  const scrollY = (scrolled || active === 1) ? 560 : 0;

  return (
    <div style={{
      height: "100%",
      display: "flex", flexDirection: "column",
      overflow: "hidden",
      position: "relative",
    }}>
      {/* Toolbar — fixed at top */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 14px",
        borderBottom: "1px solid var(--inbox-border)",
        flexShrink: 0,
      }}>
        <Icon name="back" size={13} color="var(--inbox-muted)" />
        <div style={{ display: "flex", gap: 10, color: "var(--inbox-muted)" }}>
          <Icon name="star"    size={13} />
          <Icon name="archive" size={13} />
          <Icon name="trash"   size={13} />
          <Icon name="more"    size={13} />
        </div>
      </div>

      {/* Scrollable thread content */}
      <div data-cursor="thread-body" style={{ flex: 1, overflow: "hidden", position: "relative", minHeight: 0 }}>
        <div style={{
          transform: `translateY(${-scrollY}px)`,
          transition: "transform 1100ms cubic-bezier(.22,.61,.36,1)",
          willChange: "transform",
          padding: "14px 18px 18px",
        }}>
          {/* Subject */}
          <div style={{
            fontSize: 14, fontWeight: 600,
            color: "var(--inbox-fg)",
            letterSpacing: "-0.015em",
            marginBottom: 6,
          }}>
            Q3 Planning — Action items from today's call
          </div>

          {/* Participants */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ display: "flex" }}>
              {[
                { i: "S", bg: "rgba(235,94,40,0.22)", fg: "#eb5e28" },
                { i: "D", bg: "rgba(16,185,129,0.22)", fg: "#34d399" },
                { i: "A", bg: "rgba(245,158,11,0.22)", fg: "#fbbf24" },
                { i: "P", bg: "rgba(139,92,246,0.22)", fg: "#a78bfa" },
              ].map((p: any, i: number) => (
                <div key={i} style={{
                  width: 18, height: 18, borderRadius: "50%",
                  background: p.bg, color: p.fg,
                  fontSize: 9, fontWeight: 700, fontFamily: "var(--font-mono)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginLeft: i ? -5 : 0,
                  boxShadow: `0 0 0 1.5px var(--inbox-bg)`,
                }}>{p.i}</div>
              ))}
            </div>
            <span style={{ fontSize: 10, color: "var(--inbox-faint)" }}>Sarah Chen, David Park, Alex Johnson, Priya Shah</span>
            <span style={{ fontSize: 10, color: "var(--inbox-faint)" }}>·</span>
            <span style={{ fontSize: 10, color: "var(--inbox-faint)" }}>6 messages</span>
          </div>

          {/* AI Summary — at top, target for active=0 */}
          <AISummary key={`s-${cycleId}`} />

          {/* Thread messages — collapsed list + last expanded */}
          <div style={{ marginTop: 12, borderTop: "1px solid var(--inbox-border)", borderBottom: "1px solid var(--inbox-border)" }}>
            {[
              { sender: "Sarah Chen",   initial: "S", bg: "rgba(235,94,40,0.22)", fg: "#eb5e28",
                body: "Can we align on Q3 priorities before Thursday?",          time: "10:02 AM" },
              { sender: "David Park",   initial: "D", bg: "rgba(16,185,129,0.22)", fg: "#34d399",
                body: "Engineering can commit to Aug 15. Confirming with infra.", time: "10:18 AM" },
              { sender: "Alex Johnson", initial: "A", bg: "rgba(245,158,11,0.22)", fg: "#fbbf24",
                body: "$4.2M works. Updated projections — enterprise pilot TBD.", time: "10:31 AM" },
              { sender: "Priya Shah",   initial: "P", bg: "rgba(139,92,246,0.22)", fg: "#a78bfa",
                body: "Marketing kickoff Monday confirmed. Drafting the launch brief now.", time: "10:54 AM" },
              { sender: "David Park",   initial: "D", bg: "rgba(16,185,129,0.22)", fg: "#34d399",
                body: "Infra signed off. We're clear for Aug 15.", time: "11:22 AM" },
            ].map((m: any, i: number, arr: any[]) => (
              <CollapsedMessage key={i} m={m} isLast={i === arr.length - 1} />
            ))}
          </div>

          {/* Expanded last message */}
          <div style={{ marginTop: 8 }}>
            <ExpandedMessage />
          </div>

          {/* Drafts in your voice — composer at bottom, scrolled to for active=1 */}
          <div style={{ marginTop: 16 }}>
            <DraftedReplies key={`d-${cycleId}`} />
          </div>

          <div style={{ height: 20 }} />
        </div>
      </div>

      {/* Reply composer — slides up from the bottom when a suggestion is chosen */}
      <ReplyCompose stage={replyStage} text="Looks good. Will get comments on the board deck by Wed AM." />
    </div>
  );
}

function CollapsedMessage({ m, isLast }: any) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "8px 8px",
      borderBottom: isLast ? "none" : "1px solid var(--inbox-border)",
    }}>
      <div style={{
        width: 20, height: 20, borderRadius: "50%",
        background: m.bg, color: m.fg,
        fontSize: 9, fontWeight: 700, fontFamily: "var(--font-mono)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>{m.initial}</div>
      <span style={{ fontSize: 10.5, fontWeight: 600, color: "var(--inbox-fg)", flexShrink: 0 }}>{m.sender}</span>
      <span style={{
        flex: 1, minWidth: 0,
        fontSize: 10.5, color: "var(--inbox-faint)",
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>{m.body}</span>
      <span style={{ flexShrink: 0, fontSize: 9, color: "var(--inbox-faint)" }}>{m.time}</span>
    </div>
  );
}

function ExpandedMessage() {
  return (
    <div style={{
      marginTop: 6,
      padding: "10px 12px",
      borderRadius: 8,
      border: "1px solid var(--inbox-border)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{
          width: 24, height: 24, borderRadius: "50%",
          background: "rgba(235,94,40,0.22)", color: "var(--paprika)",
          fontSize: 10, fontWeight: 700, fontFamily: "var(--font-mono)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>S</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--inbox-fg)" }}>Sarah Chen</span>
            <span style={{ fontSize: 9, color: "var(--inbox-faint)" }}>Today, 11:47 AM</span>
          </div>
          <div style={{ fontSize: 9, color: "var(--inbox-faint)", marginTop: 1 }}>to David Park, Alex Johnson</div>
        </div>
      </div>

      <div style={{ fontSize: 11, color: "var(--inbox-muted)", lineHeight: 1.6 }}>
        <p>Thanks David — great to have infra signed off. Capturing everything one more time so we're aligned heading into Thursday's exec read.</p>
        <p style={{ marginTop: 8 }}>Final recap:</p>
        <p>
          1. <span style={{ color: "var(--inbox-fg)" }}>Revenue</span> — $4.2M confirmed (+18% vs. Q2) with enterprise pilot as upside. Updated projections in the deck.<br/>
          2. <span style={{ color: "var(--inbox-fg)" }}>Product</span> — Aug 15 launch is a go. Infra signed off (thanks David). Marketing kickoff Monday — Priya owning the brief.<br/>
          3. <span style={{ color: "var(--inbox-fg)" }}>Hiring</span> — JDs for the 3 senior roles posted by Monday. David is owning sourcing the next two weeks.<br/>
          4. <span style={{ color: "var(--inbox-fg)" }}>Comms</span> — Priya to circulate the press + customer comms plan by Wed EOD.
        </p>
        <p style={{ marginTop: 8 }}>
          Board deck draft and revenue model attached. I'll need a quick 30-min sync Thursday AM to walk through the slides before the read — please flag if Wed is better.
        </p>
        <p style={{ marginTop: 8 }}>
          One open thread: do we want to include the enterprise pilot timeline in the slide, or hold for next month once we have the LOI signed? Curious where everyone lands.
        </p>
        <p style={{ marginTop: 8 }}>Thanks all,<br/>Sarah</p>
      </div>

      {/* Attachments — pill shaped */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
        {[
          { name: "Q3-Board-Deck.pdf",  size: "2.4 MB", color: "#ef4444", icon: "file" },
          { name: "Revenue-Model.xlsx", size: "840 KB", color: "#3b82f6", icon: "file" },
          { name: "Org-Chart-Q3.png",   size: "320 KB", color: "#22c55e", icon: "image" },
        ].map((f: any) => (
          <div key={f.name} style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "3px 9px",
            borderRadius: 999,
            border: "1px solid var(--inbox-border)",
            background: "var(--inbox-card)",
          }}>
            <Icon name={f.icon} size={9} color={f.color} />
            <span style={{ fontSize: 9.5, color: "var(--inbox-fg)" }}>{f.name}</span>
            <span style={{ fontSize: 8.5, color: "var(--inbox-faint)" }}>{f.size}</span>
          </div>
        ))}
      </div>

      {/* Reply / Forward */}
      <div style={{ display: "flex", gap: 8, marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--inbox-border)" }}>
        <button style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "5px 10px",
          border: "1px solid var(--inbox-border)",
          borderRadius: 5,
          fontSize: 10.5, color: "var(--inbox-muted)",
          background: "transparent",
        }}>
          <Icon name="back" size={11} /> Reply
        </button>
        <button style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "5px 10px",
          border: "1px solid var(--inbox-border)",
          borderRadius: 5,
          fontSize: 10.5, color: "var(--inbox-muted)",
          background: "transparent",
        }}>
          <Icon name="forward" size={11} /> Forward
        </button>
      </div>
    </div>
  );
}

/* ─────────────── AI SUMMARY (with word-by-word generation) ─────────────── */

function AISummary() {
  const [phase, setPhase] = useState("generating");
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("writing"), 800);
    const t2 = setTimeout(() => setPhase("done"), 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const lines = [
    ["Revenue", "Q3 target $4.2M (+18%). Enterprise pilot TBD."],
    ["Product", "Launch confirmed Aug 15. Infra signed off."],
    ["Hiring",  "3 senior roles open. JDs due EOW. David sourcing."],
    ["Comms",   "Priya drafting press + customer plan by Wed EOD."],
  ];

  // word stagger per line
  const startDelays: any[] = [];
  let acc = 800;
  for (const [label, body] of lines) {
    startDelays.push(acc);
    const wordCount = (label + " " + body).split(/\s+/).length;
    acc += wordCount * 50 + 180;
  }

  return (
    <div style={{
      borderRadius: 8,
      border: "1px solid var(--inbox-border)",
      background: "var(--inbox-card)",
      padding: "10px 12px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <span style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 12, height: 12,
          transformOrigin: "50% 50%",
          animation: phase === "done" ? "none" : "aiSpin 1.6s linear infinite",
          opacity: phase === "done" ? 0.6 : 1,
          transition: "opacity .4s ease",
        }}>
          <Icon name="sparkle" size={11} color="var(--paprika)" />
        </span>
        <span style={{
          fontSize: 10.5, fontWeight: 600,
          color: "var(--inbox-fg)", letterSpacing: "-0.01em",
        }}>
          {phase === "generating" ? "Generating summary…" : "AI Summary"}
        </span>
        <Icon name="chev-down" size={10} color="var(--inbox-faint)" />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {lines.map(([label, body], i) => (
          <div key={label} style={{
            fontSize: 10, color: "var(--inbox-muted)", lineHeight: 1.55,
            minHeight: "1.55em",
          }}>
            <TypedText
              text={`${label}: ${body}`}
              renderWord={(w: any, isFirst: any) => isFirst
                ? <strong style={{ fontWeight: 600, color: "var(--inbox-fg)" }}>{w}</strong>
                : <span>{w}</span>
              }
              startDelay={startDelays[i]}
              perWord={50}
            />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes aiSpin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

/* Word-by-word typed text */
function TypedText({ text, perWord = 55, startDelay = 0, renderWord }: any) {
  const parts = text.split(" ");
  return (
    <>
      {parts.map((w: any, i: number) => (
        <Fragment key={i}>
          <span style={{
            display: "inline-block",
            opacity: 0,
            animation: `typedIn .25s ease forwards`,
            animationDelay: `${(startDelay + i * perWord) / 1000}s`,
          }}>
            {renderWord ? renderWord(w, i === 0) : w}
          </span>
          {i < parts.length - 1 && " "}
        </Fragment>
      ))}
      <style>{`
        @keyframes typedIn {
          from { opacity: 0; transform: translateY(2px); filter: blur(2px); }
          to   { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
      `}</style>
    </>
  );
}

/* ─────────────── DRAFTS IN YOUR VOICE ─────────────── */

function DraftedReplies() {
  const [phase, setPhase] = useState("generating");
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("done"), 1400);
    return () => clearTimeout(t1);
  }, []);

  const drafts = [
    { txt: "Looks good. Will get comments on the board deck by Wed AM.", primary: true,  meta: "matches your tone" },
    { txt: "Approved — let's also loop in finance for the projections.",  primary: false, meta: "adds context"     },
    { txt: "Yes to all three. Thursday sync works on my end.",            primary: false, meta: null               },
  ];

  return (
    <div style={{
      borderRadius: 8,
      border: "1px solid var(--inbox-border)",
      background: "var(--inbox-card)",
      padding: "10px 12px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <span style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 12, height: 12,
          transformOrigin: "50% 50%",
          animation: phase === "done" ? "none" : "aiSpin 1.6s linear infinite",
          opacity: phase === "done" ? 0.6 : 1,
          transition: "opacity .4s ease",
        }}>
          <Icon name="sparkle" size={11} color="var(--paprika)" />
        </span>
        <span style={{ fontSize: 10.5, fontWeight: 600, color: "var(--inbox-fg)", letterSpacing: "-0.01em" }}>
          {phase === "done" ? "Drafts in your voice" : "Drafting in your voice…"}
        </span>
        <span style={{
          marginLeft: "auto",
          fontFamily: "var(--font-mono)",
          fontSize: 9, color: "var(--inbox-faint)", letterSpacing: "0.04em",
        }}>94% MATCH</span>
      </div>

      {drafts.map((r: any, i: number) => (
        <div key={i} data-cursor={r.primary ? "draft-primary" : undefined} style={{
          padding: "7px 10px",
          border: r.primary ? "1.5px solid var(--paprika)" : "1px solid var(--inbox-border)",
          background: r.primary ? "rgba(235,94,40,0.10)" : "transparent",
          borderRadius: 6,
          marginBottom: i < drafts.length - 1 ? 5 : 0,
          display: "flex", flexDirection: "column", gap: 3,
          opacity: 0,
          animation: `typedIn .45s ease forwards`,
          animationDelay: `${0.25 + i * 0.18}s`,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <span style={{ fontSize: 10.5, color: "var(--inbox-fg)" }}>{r.txt}</span>
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9, color: r.primary ? "var(--paprika)" : "var(--inbox-faint)",
              letterSpacing: "0.06em", flexShrink: 0,
            }}>{r.primary ? "↵ SEND" : (i + 1)}</span>
          </div>
          {r.meta && (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 8.5, color: "var(--inbox-faint)", letterSpacing: "0.04em" }}>
              {r.meta}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─────────────── REPLY COMPOSER ───────────────
   Slides up from the bottom of the pane when a suggested reply is
   chosen. Types the chosen draft in, then resolves to a sent state. */
function ReplyCompose({ stage = "idle", text = "" }: any) {
  const open = stage === "open" || stage === "sent";
  // Retain the last visible content while sliding out, so going sent→idle
  // doesn't flash the composer UI underneath during the exit transition.
  // Updated synchronously (ref, not effect) so re-opening doesn't flash either.
  const shownRef = useRef<any>(stage);
  if (stage !== "idle") shownRef.current = stage;
  const shown = shownRef.current;
  return (
    <div style={{
      position: "absolute", left: 0, right: 0, bottom: 0,
      transform: open ? "translateY(0)" : "translateY(112%)",
      transition: "transform .5s cubic-bezier(.22,.61,.36,1)",
      background: "var(--inbox-card)",
      borderTop: "1px solid var(--inbox-border)",
      boxShadow: "0 -22px 44px -28px rgba(0,0,0,0.5)",
      zIndex: 6,
    }}>
      {shown === "sent" ? (
        <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "16px" }}>
          <span style={{
            width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
            background: "rgba(235,94,40,0.16)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name="check" size={14} color="var(--paprika)" />
          </span>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--inbox-fg)", letterSpacing: "-0.01em" }}>Reply sent to Sarah Chen</div>
            <div style={{ fontSize: 10, color: "var(--inbox-muted)", marginTop: 2 }}>Bertram filed the thread and set a follow-up for Thursday.</div>
          </div>
        </div>
      ) : (
        <div style={{ padding: "10px 14px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <Icon name="back" size={12} color="var(--inbox-muted)" />
            <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--inbox-fg)", letterSpacing: "-0.01em" }}>Reply</span>
            <span style={{ fontSize: 9.5, color: "var(--inbox-faint)" }}>to Sarah Chen, +3</span>
            <span style={{ marginLeft: "auto" }}><Icon name="more" size={12} color="var(--inbox-faint)" /></span>
          </div>
          <div style={{
            minHeight: 50,
            border: "1px solid var(--inbox-border)",
            borderRadius: 7,
            background: "var(--inbox-bg)",
            padding: "9px 11px",
            fontSize: 11.5, color: "var(--inbox-fg)", lineHeight: 1.5,
          }}>
            {open ? <TypedText key={stage} text={text} perWord={42} startDelay={260} /> : null}
            <span className="cursor-blink" style={{ height: "0.95em" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 9 }}>
            <div style={{ display: "flex", gap: 12, color: "var(--inbox-faint)" }}>
              <Icon name="file" size={13} />
              <Icon name="image" size={13} />
              <Icon name="sparkle" size={13} color="var(--paprika)" />
            </div>
            <button data-cursor="reply-send" style={{
              marginLeft: "auto",
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "6px 14px", borderRadius: 6,
              background: "var(--inbox-fg)", color: "var(--inbox-sidebar)",
              fontSize: 11, fontWeight: 600, letterSpacing: "-0.01em",
            }}>
              Send
              <Icon name="send" size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────── DAVID SCHEDULE THREAD ─────────────── */

function DavidScheduleThread({ holdStage = "idle" }: any) {
  const filling = holdStage === "holding" || holdStage === "held";
  const slots = [
    { day: "WED · NOV 12", time: "1:00 – 1:30 PM" },
    { day: "WED · NOV 12", time: "3:00 – 3:30 PM", mid: true },
    { day: "FRI · NOV 14", time: "10:00 – 10:30 AM" },
  ];
  const helper = holdStage === "held"
    ? "Held Wed, Nov 12 · 3:00 PM — invite sent to David, 10 min prep blocked each side."
    : holdStage === "holding"
    ? "Holding Wed, Nov 12 · 3:00 PM…"
    : "Three times offered. Press and hold one — Bertram books it and sends the invite.";
  return (
    <div style={{
      height: "100%",
      display: "flex", flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* Toolbar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 14px",
        borderBottom: "1px solid var(--inbox-border)",
        flexShrink: 0,
      }}>
        <Icon name="back" size={13} color="var(--inbox-muted)" />
        <div style={{ display: "flex", gap: 10, color: "var(--inbox-muted)" }}>
          <Icon name="star"    size={13} />
          <Icon name="archive" size={13} />
          <Icon name="trash"   size={13} />
          <Icon name="more"    size={13} />
        </div>
      </div>

      <div style={{ flex: 1, overflow: "hidden", padding: "14px 18px" }}>
        {/* Subject */}
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--inbox-fg)", letterSpacing: "-0.015em", marginBottom: 6 }}>
          Re: Can we move Thursday's standup?
        </div>

        {/* Participants */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{
            width: 18, height: 18, borderRadius: "50%",
            background: "rgba(16,185,129,0.22)", color: "#34d399",
            fontSize: 9, fontWeight: 700, fontFamily: "var(--font-mono)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>D</div>
          <span style={{ fontSize: 10, color: "var(--inbox-faint)" }}>David Park</span>
          <span style={{ fontSize: 10, color: "var(--inbox-faint)" }}>· 5 messages</span>
        </div>

        {/* Latest message */}
        <div style={{
          padding: "10px 12px",
          border: "1px solid var(--inbox-border)",
          borderRadius: 8,
          marginBottom: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{
              width: 22, height: 22, borderRadius: "50%",
              background: "rgba(16,185,129,0.22)", color: "#34d399",
              fontSize: 10, fontWeight: 700, fontFamily: "var(--font-mono)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>D</div>
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--inbox-fg)" }}>David Park</div>
              <div style={{ fontSize: 9, color: "var(--inbox-faint)" }}>Today, 9:42 AM</div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: "var(--inbox-muted)", lineHeight: 1.55 }}>
            Got a conflict Thursday — would Wed or Fri afternoon work? Just need ~30 minutes to align on Q4 priorities and the upcoming launch.
          </div>
        </div>

        {/* Scheduling assistant — styled like AI Summary, not as a callout */}
        <div style={{
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid var(--inbox-border)",
          background: "var(--inbox-card)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <Icon name="sparkle" size={11} color="var(--paprika)" />
            <span style={{ fontSize: 10.5, fontWeight: 600, color: "var(--inbox-fg)", letterSpacing: "-0.01em" }}>
              Meeting detected
            </span>
            <span style={{
              marginLeft: "auto",
              fontFamily: "var(--font-mono)",
              fontSize: 9, color: "var(--inbox-faint)", letterSpacing: "0.04em",
            }}>VIA GOOGLE CAL</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {slots.map((s: any, i: number) => {
              const lit = s.mid && filling;
              return (
                <div key={i}
                  data-cursor={s.mid ? "slot-mid" : undefined}
                  style={{
                    position: "relative", overflow: "hidden",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "7px 11px",
                    border: lit ? "1px solid var(--paprika)" : "1px solid var(--inbox-border)",
                    borderRadius: 6,
                    transition: "border-color .3s ease",
                  }}>
                  {s.mid && (
                    <div aria-hidden="true" style={{
                      position: "absolute", left: 0, top: 0, bottom: 0,
                      width: filling ? "100%" : "0%",
                      background: "rgba(235,94,40,0.16)",
                      transition: "width 1.25s linear",
                      pointerEvents: "none",
                    }} />
                  )}
                  <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--inbox-faint)", letterSpacing: "0.04em" }}>{s.day}</span>
                    <span style={{ fontSize: 11, color: "var(--inbox-fg)" }}>{s.time}</span>
                  </div>
                  <span style={{
                    position: "relative",
                    fontFamily: "var(--font-mono)",
                    fontSize: 9, color: lit ? "var(--paprika)" : "var(--inbox-faint)",
                    letterSpacing: "0.06em",
                  }}>{s.mid
                    ? (holdStage === "held" ? "✓ HELD" : holdStage === "holding" ? "HOLDING…" : "OFFER")
                    : "OFFER"}</span>
                </div>
              );
            })}
          </div>

          <div style={{ fontSize: 10, color: "var(--inbox-muted)", marginTop: 10, lineHeight: 1.5 }}>
            {helper}
          </div>
        </div>
      </div>
    </div>
  );
}

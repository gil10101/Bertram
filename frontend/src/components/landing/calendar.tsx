"use client";

import { useRef, useEffect } from "react";
import { Icon } from "./icons";

// Bertram Calendar pane — replaces ThreadList + ThreadPane when user clicks
// the Meetings nav item in the inbox sidebar. Single pane (no agenda + detail
// split). Shows three features in inline detail on the selected meeting:
//   1. Bertram Brief — pre-meeting context from the source thread
//   4. Pre-reads     — Bertram extracts the one sentence that matters
//   6. Buffer        — auto-blocked prep + wrap time, visible as ghost rows

const TODAY_SCHEDULE = [
  { type: "focus",   start: "09:00", end: "09:45", label: "Focus · deep work" },
  { type: "buffer",  start: "09:45", end: "10:00", label: "Prep", forKey: "q3", min: 15 },
  {
    type: "meeting", start: "10:00", end: "11:00", k: "q3",
    title: "Q3 Planning sync",
    link: "meet.bertram.io/q3-planning",
    people: [
      { i: "S", c: "rgba(235,94,40,0.22)",   fg: "#eb5e28" },
      { i: "D", c: "rgba(16,185,129,0.22)",  fg: "#34d399" },
      { i: "P", c: "rgba(139,92,246,0.22)",  fg: "#a78bfa" },
      { i: "A", c: "rgba(245,158,11,0.22)",  fg: "#fbbf24" },
    ],
    peopleCount: 4,
    sourceThread: "Sarah Chen · \"Q3 Planning — Action items\"",
    brief:
      "Follow-up to Sarah's Nov 8 thread. The team has aligned on Aug 15 launch and a $4.2M target — this sync is for final sign-off before Thursday's board read.",
    expected: [
      "Sign off on the $4.2M Q3 target",
      "Pick enterprise pilot launch date",
    ],
    prereads: [
      { name: "Q3-Board-Deck.pdf",  size: "2.4 MB", c: "#ef4444",
        extract: "Slides 4–7 cover enterprise pilot economics" },
      { name: "Revenue-Model.xlsx", size: "840 KB", c: "#3b82f6",
        extract: "$4.2M target · 18% QoQ growth assumption" },
      { name: "Org-Chart-Q3.png",   size: "320 KB", c: "#22c55e",
        extract: "3 open eng roles, 2 reporting to David" },
    ],
    bufferPrep: 15, bufferWrap: 15,
  },
  { type: "buffer",  start: "11:00", end: "11:15", label: "Wrap", forKey: "q3", min: 15 },
  { type: "focus",   start: "11:15", end: "13:00", label: "Build time" },
  { type: "lunch",   start: "13:00", end: "13:20", label: "Lunch" },
  { type: "focus",   start: "13:30", end: "14:50", label: "Open" },
  { type: "buffer",  start: "14:50", end: "15:00", label: "Prep", forKey: "david", min: 10 },
  {
    type: "meeting", start: "15:00", end: "15:30", k: "david",
    title: "1:1 with David",
    isNew: true,
    link: "meet.bertram.io/david-sync",
    people: [{ i: "D", c: "rgba(16,185,129,0.22)", fg: "#34d399" }],
    peopleCount: 1,
    sourceThread: "David Park · \"Can we move Thursday's standup?\"",
    brief:
      "Just booked from David's thread — he needed 30 minutes to align on Q4 priorities and the upcoming launch. Bertram sent the invite and blocked prep on both sides.",
    expected: [
      "Lock Q4 priorities ahead of the launch",
      "Confirm launch-week on-call coverage",
    ],
    prereads: [
      { name: "q4-priorities.md",  size: "9 KB",   c: "#8b5cf6",
        extract: "Draft list — observability + launch hardening lead the stack" },
      { name: "launch-runbook.pdf", size: "1.1 MB", c: "#ef4444",
        extract: "Cutover + rollback steps; 3 owners still unassigned" },
    ],
    bufferPrep: 10, bufferWrap: 15,
  },
  { type: "buffer",  start: "15:30", end: "15:45", label: "Wrap", forKey: "david", min: 15 },
  { type: "buffer",  start: "15:45", end: "16:00", label: "Prep", forKey: "marketing", min: 15 },
  {
    type: "meeting", start: "16:00", end: "17:00", k: "marketing",
    title: "Marketing kickoff",
    link: "meet.bertram.io/marketing-kickoff",
    people: [
      { i: "P", c: "rgba(139,92,246,0.22)", fg: "#a78bfa" },
      { i: "M", c: "rgba(244,63,94,0.22)",  fg: "#fb7185" },
      { i: "R", c: "rgba(6,182,212,0.22)",  fg: "#22d3ee" },
    ],
    peopleCount: 7,
    sourceThread: "Priya Shah · \"Launch brief — kickoff Wed\"",
    brief:
      "Kickoff for the Aug 15 launch comms. Priya has the brief drafted; you're here to weigh in on messaging emphasis and channel mix. Six team members + you.",
    expected: [
      "Confirm primary launch message",
      "Channel + budget mix sign-off",
    ],
    prereads: [
      { name: "launch-brief-v2.pdf", size: "1.8 MB", c: "#ef4444",
        extract: "Primary thesis: \"inbox that finishes for you\" — A/B vs. \"AI inbox\"" },
      { name: "channel-mix.xlsx",    size: "320 KB", c: "#3b82f6",
        extract: "60% paid social, 25% partner co-mkt, 15% organic" },
    ],
    bufferPrep: 15, bufferWrap: 15,
  },
  { type: "buffer",  start: "17:00", end: "17:15", label: "Wrap", forKey: "marketing", min: 15 },
];

const WEEK_DAYS = [
  { day: "Mon", date: 10, load: 0.35 },
  { day: "Tue", date: 11, load: 0.55 },
  { day: "Wed", date: 12, load: 0.85, today: true },
  { day: "Thu", date: 13, load: 0.55 },
  { day: "Fri", date: 14, load: 0.30 },
  { day: "Sat", date: 15, load: 0.0 },
  { day: "Sun", date: 16, load: 0.0 },
];

/* ════════════════════════════════════════════════════════════════
   PANE
   ════════════════════════════════════════════════════════════════ */

export function CalendarPane({ selected = "q3", onSelect = () => {}, scrollReq = null }: any) {
  const meetings = TODAY_SCHEDULE.filter(b => b.type === "meeting");
  const meetingCount = meetings.length;
  const meetingHours = meetings.reduce((acc) => acc + 1, 0); // each here is 60m
  const scrollRef = useRef<any>(null);

  // Bring a requested meeting up near the top of the scroll frame, so the
  // cursor (which is about to glide to it) never has to point off-frame.
  useEffect(() => {
    if (!scrollReq || !scrollRef.current) return;
    const c = scrollRef.current;
    const el = c.querySelector('[data-cursor="meeting-' + scrollReq.k + '"]');
    if (!el) return;
    const top = el.getBoundingClientRect().top - c.getBoundingClientRect().top + c.scrollTop;
    c.scrollTo({ top: Math.max(0, top - 16), behavior: "smooth" });
  }, [scrollReq && scrollReq.key]);

  return (
    <div style={{
      flex: 1, minWidth: 0,
      borderRadius: 8,
      overflow: "hidden",
      background: "var(--inbox-bg)",
      display: "flex", flexDirection: "column",
      position: "relative",
    }}>
      <CalendarToolbar meetingCount={meetingCount} meetingHours={meetingHours} />
      <WeekStrip />
      <div ref={scrollRef} style={{
        flex: 1, minHeight: 0,
        overflowY: "auto",
        padding: "10px 0 14px",
      }}>
        <DaySchedule selected={selected} onSelect={onSelect} />
      </div>
    </div>
  );
}

/* ────────── Toolbar ────────── */

function CalendarToolbar({ meetingCount, meetingHours }: any) {
  return (
    <div style={{
      display: "flex", alignItems: "center",
      padding: "10px 16px",
      borderBottom: "1px solid var(--inbox-border)",
      gap: 14, flexShrink: 0,
    }}>
      <div>
        <div style={{
          fontSize: 14, fontWeight: 700,
          color: "var(--inbox-fg)", letterSpacing: "-0.01em",
        }}>
          Wednesday, November 12
        </div>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 9.5,
          color: "var(--inbox-faint)", letterSpacing: "0.06em",
          marginTop: 2,
        }}>
          TODAY · {meetingCount} MEETINGS · {meetingHours}H BOOKED
        </div>
      </div>
      <div style={{
        marginLeft: "auto",
        display: "flex", alignItems: "center", gap: 6,
        color: "var(--inbox-muted)",
      }}>
        <CalendarBtn><Icon name="chev-left" size={12} /></CalendarBtn>
        <CalendarBtn label="Today" />
        <CalendarBtn><Icon name="chev-right" size={12} /></CalendarBtn>
        <span style={{
          margin: "0 4px 0 8px",
          width: 1, height: 16,
          background: "var(--inbox-border)",
        }}/>
        <CalendarBtn label="Day" active />
        <CalendarBtn label="Week" />
        <CalendarBtn label="Month" />
      </div>
    </div>
  );
}

function CalendarBtn({ children, label, active, onClick }: any) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      gap: 4, padding: label ? "5px 10px" : "5px 6px",
      borderRadius: 5,
      background: active ? "var(--inbox-accent)" : "transparent",
      color: active ? "var(--inbox-fg)" : "var(--inbox-muted)",
      border: active ? "1px solid var(--inbox-border)" : "1px solid transparent",
      fontSize: 11, fontWeight: 500, letterSpacing: "-0.005em",
      cursor: "pointer",
    }}>{label || children}</button>
  );
}

/* ────────── Week strip ────────── */

function WeekStrip() {
  return (
    <div style={{
      display: "flex", gap: 4,
      padding: "10px 16px",
      borderBottom: "1px solid var(--inbox-border)",
      flexShrink: 0,
      background: "color-mix(in oklab, var(--inbox-bg) 70%, var(--inbox-sidebar))",
    }}>
      {WEEK_DAYS.map((d: any, i: number) => (
        <div key={i} style={{
          flex: 1,
          padding: "6px 8px",
          borderRadius: 6,
          background: d.today ? "var(--inbox-accent)" : "transparent",
          border: d.today ? "1px solid var(--inbox-border)" : "1px solid transparent",
        }}>
          <div style={{
            display: "flex", alignItems: "baseline", justifyContent: "space-between",
            marginBottom: 5,
          }}>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 9,
              color: d.today ? "var(--inbox-fg)" : "var(--inbox-faint)",
              letterSpacing: "0.08em", textTransform: "uppercase",
              fontWeight: d.today ? 600 : 400,
            }}>{d.day}</span>
            <span style={{
              fontSize: 13, fontWeight: d.today ? 700 : 500,
              color: "var(--inbox-fg)",
              letterSpacing: "-0.01em",
              opacity: d.today ? 1 : 0.85,
            }}>{d.date}</span>
          </div>
          <div style={{
            width: "100%", height: 3, borderRadius: 2,
            background: "color-mix(in oklab, var(--inbox-border) 60%, transparent)",
            overflow: "hidden",
          }}>
            <div style={{
              width: `${d.load * 100}%`, height: "100%",
              background: d.today
                ? "var(--paprika)"
                : d.load > 0.5
                  ? "color-mix(in oklab, var(--paprika) 50%, var(--inbox-faint))"
                  : "var(--inbox-faint)",
              opacity: d.today ? 1 : 0.8,
            }}/>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ────────── Day schedule ────────── */

function DaySchedule({ selected, onSelect }: any) {
  // Buffer is now spoken about by Bertram inline in the meeting brief,
  // not rendered as its own block on the calendar.
  const visible = TODAY_SCHEDULE.filter(b => b.type !== "buffer");
  return (
    <div>
      {visible.map((b: any, i: number) => {
        if (b.type === "meeting") {
          return (
            <MeetingBlock key={i} block={b}
              selected={selected === b.k}
              onClick={() => onSelect(b.k)}
            />
          );
        }
        if (b.type === "focus")  return <FocusBlock  key={i} block={b} />;
        if (b.type === "lunch")  return <LunchBlock  key={i} block={b} />;
        return null;
      })}
    </div>
  );
}

/* Shared time gutter */
function TimeGutter({ time, dim }: any) {
  return (
    <div style={{
      width: 54, flexShrink: 0,
      paddingTop: 2,
      fontFamily: "var(--font-mono)",
      fontSize: 9.5,
      color: dim ? "color-mix(in oklab, var(--inbox-faint) 60%, transparent)" : "var(--inbox-faint)",
      letterSpacing: "0.04em",
      textAlign: "right",
      paddingRight: 10,
    }}>
      {time}
    </div>
  );
}

/* ────────── Meeting block (with inline expanded detail) ────────── */

function FocusBlock({ block }: any) {
  return (
    <div style={{
      display: "flex", alignItems: "stretch",
      padding: "4px 16px 4px 0",
    }}>
      <TimeGutter time={block.start} />
      <div style={{
        flex: 1, marginLeft: 8,
        padding: "10px 12px",
        borderRadius: 6,
        background: "color-mix(in oklab, var(--inbox-sidebar) 60%, transparent)",
        border: "1px solid color-mix(in oklab, var(--inbox-border) 60%, transparent)",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          width: 3, alignSelf: "stretch",
          background: "color-mix(in oklab, var(--inbox-fg) 25%, transparent)",
          borderRadius: 2,
        }}/>
        <span style={{
          fontSize: 11.5, fontWeight: 500,
          color: "color-mix(in oklab, var(--inbox-fg) 75%, transparent)",
          letterSpacing: "-0.005em",
        }}>{block.label}</span>
        <span style={{
          marginLeft: "auto",
          fontFamily: "var(--font-mono)", fontSize: 9,
          color: "var(--inbox-faint)", letterSpacing: "0.06em",
        }}>{block.start} – {block.end}</span>
      </div>
    </div>
  );
}

function LunchBlock({ block }: any) {
  return (
    <div style={{
      display: "flex", alignItems: "center",
      padding: "3px 16px 3px 0",
    }}>
      <TimeGutter time={block.start} />
      <div style={{
        flex: 1, marginLeft: 8,
        padding: "5px 12px",
        fontSize: 10.5, color: "var(--inbox-faint)",
        fontStyle: "italic",
      }}>
        {block.label}
      </div>
    </div>
  );
}

/* ────────── Meeting block (with inline expanded detail) ────────── */

function MeetingBlock({ block, selected, onClick }: any) {
  return (
    <div style={{
      display: "flex", alignItems: "stretch",
      padding: "4px 16px 4px 0",
    }}>
      <TimeGutter time={block.start} />
      <div
        onClick={onClick}
        data-cursor={"meeting-" + block.k}
        style={{
          flex: 1, marginLeft: 8,
          padding: selected ? "14px 16px 16px" : "10px 14px",
          borderRadius: 8,
          background: "var(--inbox-card)",
          border: selected
            ? "1.5px solid color-mix(in oklab, var(--inbox-fg) 35%, var(--inbox-border))"
            : "1px solid var(--inbox-border)",
          boxShadow: selected ? "0 12px 30px -16px rgba(0,0,0,0.35)" : "none",
          cursor: "pointer",
          transition: "background .25s ease, border-color .25s ease, padding .25s ease",
          position: "relative",
          animation: block.isNew ? "meetingCreate 0.6s cubic-bezier(.22,.61,.36,1), meetingGlow 1.6s ease 0.15s" : undefined,
        }}>

        {/* HEADER ROW */}
        <div style={{ display: "flex", alignItems: "start", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              marginBottom: 4, flexWrap: "wrap",
            }}>
              <span style={{
                fontSize: 13.5, fontWeight: 600,
                color: "var(--inbox-fg)", letterSpacing: "-0.015em",
              }}>{block.title}</span>
              {block.isNew && (
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 8.5, fontWeight: 600,
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  color: "#fff", background: "var(--paprika)",
                  padding: "2px 6px", borderRadius: 4,
                }}>Just booked</span>
              )}
              {block.recurring && (
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 9,
                  color: "var(--inbox-faint)", letterSpacing: "0.06em",
                }}>↻ weekly</span>
              )}
              {!selected && (
                <>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 3,
                    fontFamily: "var(--font-mono)", fontSize: 9,
                    color: "var(--inbox-muted)", letterSpacing: "0.06em",
                  }}>
                    <Icon name="sparkle" size={9} color="var(--paprika)" />
                    Brief
                  </span>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 3,
                    fontFamily: "var(--font-mono)", fontSize: 9,
                    color: "var(--inbox-faint)", letterSpacing: "0.06em",
                  }}>
                    <Icon name="file" size={9} color="var(--inbox-faint)" />
                    {block.prereads.length}
                  </span>
                </>
              )}
            </div>

            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              fontSize: 10.5, color: "var(--inbox-muted)",
              flexWrap: "wrap",
            }}>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 10,
                color: "var(--inbox-fg)", letterSpacing: "0.02em",
              }}>{block.start} – {block.end}</span>
              <span style={{ color: "var(--inbox-faint)" }}>·</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <Icon name="people" size={10} color="var(--inbox-faint)" />
                {block.peopleCount} {block.peopleCount === 1 ? "person" : "people"}
              </span>
              <span style={{ color: "var(--inbox-faint)" }}>·</span>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 10,
                color: "var(--inbox-muted)",
              }}>{block.link}</span>
            </div>
          </div>

          {/* People */}
          <div style={{ display: "flex", flexShrink: 0 }}>
            {block.people.slice(0, 4).map((p: any, i: number) => (
              <div key={i} style={{
                width: 22, height: 22, borderRadius: "50%",
                background: p.c, color: p.fg,
                fontSize: 9.5, fontWeight: 700, fontFamily: "var(--font-mono)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginLeft: i ? -5 : 0,
                boxShadow: `0 0 0 1.5px var(--inbox-card)`,
              }}>{p.i}</div>
            ))}
            {block.peopleCount > block.people.length && (
              <div style={{
                width: 22, height: 22, borderRadius: "50%",
                background: "color-mix(in oklab, var(--inbox-accent) 60%, transparent)",
                color: "var(--inbox-fg)",
                fontSize: 9, fontFamily: "var(--font-mono)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginLeft: -5,
                boxShadow: `0 0 0 1.5px var(--inbox-card)`,
              }}>+{block.peopleCount - block.people.length}</div>
            )}
          </div>

          {/* Join button (only when selected) */}
          {selected && (
            <button style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "6px 12px",
              borderRadius: 6,
              background: "var(--paprika)", color: "#fff",
              border: "1px solid var(--paprika)",
              fontSize: 11, fontWeight: 600,
              letterSpacing: "-0.01em",
              cursor: "pointer",
              flexShrink: 0,
            }}>
              <Icon name="forward" size={10} />
              Join
            </button>
          )}
        </div>

        {/* EXPANDED DETAIL — Brief + Pre-reads + Buffer */}
        {selected && (
          <div style={{ marginTop: 14, paddingLeft: 13 }}>
            {/* Brief */}
            <DetailSection
              icon="sparkle"
              label="Brief"
              meta={`from ${block.sourceThread}`}
            >
              <div style={{
                fontSize: 11.5, color: "var(--inbox-muted)",
                lineHeight: 1.55,
                marginBottom: 8,
              }}>
                {block.brief}
              </div>
              <div style={{
                padding: "8px 10px",
                borderRadius: 5,
                background: "color-mix(in oklab, var(--inbox-bg) 50%, transparent)",
                border: "1px solid var(--inbox-border)",
              }}>
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: 8.5,
                  color: "var(--inbox-faint)", letterSpacing: "0.08em",
                  textTransform: "uppercase", marginBottom: 4,
                }}>What's expected of you</div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {block.expected.map((t: any, i: number) => (
                    <li key={i} style={{
                      fontSize: 11, color: "var(--inbox-fg)",
                      lineHeight: 1.5,
                      display: "flex", gap: 7,
                      marginTop: i ? 2 : 0,
                    }}>
                      <span style={{
                        flexShrink: 0, marginTop: 6,
                        width: 4, height: 4, borderRadius: "50%",
                        background: "color-mix(in oklab, var(--inbox-fg) 60%, transparent)",
                      }}/>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </DetailSection>

            {/* Pre-reads */}
            <DetailSection
              icon="file"
              label={`Pre-reads · ${block.prereads.length}`}
              meta="key line per doc"
            >
              {block.prereads.map((f: any, i: number) => (
                <div key={i} style={{
                  display: "flex", alignItems: "start", gap: 10,
                  padding: "6px 0",
                  borderTop: i ? "1px solid color-mix(in oklab, var(--inbox-border) 50%, transparent)" : "none",
                }}>
                  <Icon name="file" size={11} color={f.c} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                      <span style={{
                        fontSize: 11, color: "var(--inbox-fg)",
                        fontWeight: 500, letterSpacing: "-0.005em",
                      }}>{f.name}</span>
                      <span style={{ fontSize: 9, color: "var(--inbox-faint)" }}>{f.size}</span>
                    </div>
                    <div style={{
                      fontSize: 10.5, color: "var(--inbox-muted)",
                      lineHeight: 1.45, fontStyle: "italic",
                      marginTop: 1,
                    }}>"{f.extract}"</div>
                  </div>
                </div>
              ))}
            </DetailSection>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailSection({ icon, label, meta, children }: any) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        marginBottom: 8,
      }}>
        <Icon name={icon} size={11} color="var(--paprika)" />
        <span style={{
          fontSize: 10.5, fontWeight: 600,
          color: "var(--inbox-fg)", letterSpacing: "-0.005em",
        }}>{label}</span>
        {meta && (
          <span style={{
            marginLeft: "auto",
            fontFamily: "var(--font-mono)", fontSize: 9,
            color: "var(--inbox-faint)", letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}>{meta}</span>
        )}
      </div>
      {children}
    </div>
  );
}

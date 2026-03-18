"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import type { Meeting } from "@/types/meeting";
import { getProviders, PROVIDER_COLORS } from "./meeting-card";

type CalendarView = "day" | "workweek" | "week" | "month";

const VIEW_LABELS: Record<CalendarView, string> = {
  day: "Today",
  workweek: "Work Week",
  week: "Week",
  month: "Month",
};

interface MeetingCalendarProps {
  meetings: Meeting[];
  onMeetingClick?: (meeting: Meeting) => void;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const HOUR_START = 6;
const HOUR_END = 22;
const TOTAL_MINUTES = (HOUR_END - HOUR_START) * 60;
const ROW_HEIGHT = 44;
const PX_PER_MINUTE = ROW_HEIGHT / 60;

function getTimeSlots() {
  const slots: string[] = [];
  for (let h = HOUR_START; h <= HOUR_END; h++) {
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    const ampm = h < 12 ? "AM" : "PM";
    slots.push(`${hour12} ${ampm}`);
  }
  return slots;
}

// --- Time Grid View (shared for day, workweek, week) ---

function TimeGridView({
  meetings,
  days,
  onMeetingClick,
}: {
  meetings: Meeting[];
  days: Date[];
  onMeetingClick?: (meeting: Meeting) => void;
}) {
  const today = new Date();
  const timeSlots = useMemo(() => getTimeSlots(), []);
  const colCount = days.length;

  // Current time indicator — updates every minute
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  const nowMinutes = now.getHours() * 60 + now.getMinutes() - HOUR_START * 60;
  const nowPx = nowMinutes * PX_PER_MINUTE;
  const showIndicator = nowMinutes >= 0 && nowMinutes <= TOTAL_MINUTES;

  const meetingsByDay = useMemo(() => {
    const map = new Map<number, Meeting[]>();
    for (let i = 0; i < colCount; i++) map.set(i, []);
    for (const m of meetings) {
      const start = new Date(m.start_time);
      for (let i = 0; i < colCount; i++) {
        if (isSameDay(start, days[i])) {
          map.get(i)!.push(m);
          break;
        }
      }
    }
    return map;
  }, [meetings, days, colCount]);

  return (
    <div className="flex overflow-hidden rounded-b-lg">
      {/* Time gutter */}
      <div className="relative w-16 flex-shrink-0 border-r border-border/50 bg-background/30">
        {timeSlots.map((label, i) => (
          <div
            key={label}
            className="flex items-start justify-end pr-2"
            style={{ height: `${ROW_HEIGHT}px`, ...(i === 0 ? { marginTop: 0 } : {}) }}
          >
            <span className="relative -top-2 text-[10px] text-muted-foreground">{label}</span>
          </div>
        ))}
        {/* Current time marker in gutter */}
        {showIndicator && (
          <div
            className="pointer-events-none absolute right-0 z-20 flex items-center"
            style={{ top: `${nowPx}px` }}
          >
            <div className="h-[2px] w-3 bg-muted-foreground" />
          </div>
        )}
      </div>

      {/* Day columns */}
      <div className="grid flex-1" style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }}>
        {days.map((day, dayIdx) => {
          const isToday = isSameDay(day, today);
          const dayMeetings = meetingsByDay.get(dayIdx) ?? [];

          return (
            <div
              key={dayIdx}
              className={cn(
                "relative border-r border-border/50 last:border-r-0",
                isToday && "bg-border/20",
              )}
            >
              {/* Hour grid lines */}
              {timeSlots.map((_, i) => (
                <div key={i} className="border-b border-border/30" style={{ height: `${ROW_HEIGHT}px` }} />
              ))}

              {/* Meeting blocks */}
              {dayMeetings.map((m) => {
                const start = new Date(m.start_time);
                const end = new Date(m.end_time);
                const startMinutes = start.getHours() * 60 + start.getMinutes() - HOUR_START * 60;
                const endMinutes = end.getHours() * 60 + end.getMinutes() - HOUR_START * 60;
                const topPx = Math.max(0, startMinutes * PX_PER_MINUTE);
                const heightPx = Math.max(18, (endMinutes - startMinutes) * PX_PER_MINUTE);
                const providers = getProviders(m);

                return (
                  <div
                    key={m.id}
                    onClick={() => onMeetingClick?.(m)}
                    className="absolute inset-x-0.5 flex cursor-pointer overflow-hidden rounded bg-border text-foreground transition-opacity hover:opacity-80"
                    style={{ top: `${topPx}px`, height: `${heightPx}px` }}
                    title={`${m.title}\n${formatTime(start)} – ${formatTime(end)}`}
                  >
                    {/* Provider color stripe */}
                    <div className="flex w-1 flex-shrink-0 flex-col">
                      {providers.map((p) => (
                        <div
                          key={p}
                          className="flex-1 bg-muted-foreground"
                        />
                      ))}
                    </div>
                    <div className="min-w-0 flex-1 px-1.5 py-0.5">
                      <p className="truncate text-[11px] font-semibold leading-tight">{m.title}</p>
                      <p className="truncate text-[10px] leading-tight opacity-70">
                        {formatTime(start)} – {formatTime(end)}
                      </p>
                      {heightPx > 40 && m.location && (
                        <p className="mt-0.5 truncate text-[9px] leading-tight opacity-60">
                          {m.location}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Current time indicator */}
              {isToday && showIndicator && (
                <div
                  className="pointer-events-none absolute inset-x-0 z-20 flex items-center"
                  style={{ top: `${nowPx}px` }}
                >
                  <div className="h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-muted-foreground" />
                  <div className="h-[2px] flex-1 bg-muted-foreground" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- Month View ---

function MonthView({
  meetings,
  viewYear,
  viewMonth,
  onMeetingClick,
}: {
  meetings: Meeting[];
  viewYear: number;
  viewMonth: number;
  onMeetingClick?: (meeting: Meeting) => void;
}) {
  const today = new Date();
  const todayKey = today.toLocaleDateString("en-CA");

  const meetingsByDate = useMemo(() => {
    const map = new Map<string, Meeting[]>();
    for (const m of meetings) {
      const dateKey = new Date(m.start_time).toLocaleDateString("en-CA");
      const existing = map.get(dateKey) ?? [];
      existing.push(m);
      map.set(dateKey, existing);
    }
    return map;
  }, [meetings]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="grid grid-cols-7">
      {cells.map((day, i) => {
        if (day === null) {
          return <div key={`empty-${i}`} className="min-h-[96px] border-b border-r border-border/30 bg-background/20 p-1" />;
        }

        const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const dayMeetings = meetingsByDate.get(dateKey) ?? [];
        const isToday = dateKey === todayKey;

        return (
          <div
            key={dateKey}
            className={cn(
              "min-h-[96px] border-b border-r border-border/30 p-1 transition-colors",
              isToday && "bg-border/20",
            )}
          >
            <span
              className={cn(
                "mb-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs",
                isToday ? "bg-foreground font-semibold text-background" : "text-muted-foreground",
              )}
            >
              {day}
            </span>
            <div className="flex flex-col gap-0.5">
              {dayMeetings.slice(0, 2).map((m) => {
                const start = new Date(m.start_time);
                const end = new Date(m.end_time);
                const providers = getProviders(m);
                return (
                  <div
                    key={m.id}
                    onClick={() => onMeetingClick?.(m)}
                    className="flex cursor-pointer overflow-hidden rounded bg-border text-[10px] leading-tight text-foreground"
                    title={`${m.title}\n${formatTime(start)} – ${formatTime(end)}`}
                  >
                    <div className="flex w-0.5 flex-shrink-0 flex-col">
                      {providers.map((p) => (
                        <div key={p} className="flex-1 bg-muted-foreground" />
                      ))}
                    </div>
                    <span className="truncate px-1 py-0.5">
                      {formatTime(start)} – {formatTime(end)} {m.title}
                    </span>
                  </div>
                );
              })}
              {dayMeetings.length > 2 && (
                <span className="px-1 text-[10px] text-muted-foreground">
                  +{dayMeetings.length - 2} more
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- Helpers for building day arrays ---

function getWorkWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  // Go back to Monday (day 1). If Sunday (0), go back 6 days.
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function buildDays(view: CalendarView, anchor: Date): Date[] {
  if (view === "day") return [new Date(anchor)];
  if (view === "workweek") {
    const start = getWorkWeekStart(anchor);
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  }
  // "week"
  const start = getWeekStart(anchor);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

// --- Main Calendar Component ---

export function MeetingCalendar({ meetings, onMeetingClick }: MeetingCalendarProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [view, setView] = useState<CalendarView>("week");
  const [anchor, setAnchor] = useState(() => new Date(today));
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  const days = useMemo(() => (view === "month" ? [] : buildDays(view, anchor)), [view, anchor]);

  const stepSize = view === "day" ? 1 : view === "workweek" ? 7 : 7;

  const goToPrev = useCallback(() => {
    if (view === "month") {
      if (viewMonth === 0) {
        setViewMonth(11);
        setViewYear((y) => y - 1);
      } else {
        setViewMonth((m) => m - 1);
      }
    } else {
      setAnchor((a) => {
        const d = new Date(a);
        d.setDate(d.getDate() - stepSize);
        return d;
      });
    }
  }, [view, viewMonth, stepSize]);

  const goToNext = useCallback(() => {
    if (view === "month") {
      if (viewMonth === 11) {
        setViewMonth(0);
        setViewYear((y) => y + 1);
      } else {
        setViewMonth((m) => m + 1);
      }
    } else {
      setAnchor((a) => {
        const d = new Date(a);
        d.setDate(d.getDate() + stepSize);
        return d;
      });
    }
  }, [view, viewMonth, stepSize]);

  const goToToday = useCallback(() => {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setAnchor(new Date(now));
  }, []);

  const selectView = useCallback((v: CalendarView) => {
    if (v === "day") {
      // "Today" — jump to today and switch to day view
      goToToday();
    }
    setView(v);
    setDropdownOpen(false);
  }, [goToToday]);

  // Header label
  const headerLabel = useMemo(() => {
    if (view === "month") {
      return `${MONTH_NAMES[viewMonth]} ${viewYear}`;
    }
    if (view === "day" && days.length === 1) {
      return days[0].toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    }
    const first = days[0];
    const last = days[days.length - 1];
    if (!first || !last) return "";
    return `${first.toLocaleDateString([], { month: "short", day: "numeric" })} – ${last.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}`;
  }, [view, days, viewMonth, viewYear]);

  // Day labels for time-grid views
  const dayLabelsForGrid = view !== "month" && days.length > 0;

  return (
    <div className="rounded-lg border border-border bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrev}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-border hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={goToNext}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-border hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <h3 className="text-sm font-semibold tracking-tight text-foreground">{headerLabel}</h3>
        </div>

        {/* View dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-border hover:text-foreground"
          >
            {VIEW_LABELS[view]}
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", dropdownOpen && "rotate-180")} />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 z-30 mt-1 min-w-[140px] overflow-hidden rounded-md border border-border bg-background shadow-lg">
              {(Object.keys(VIEW_LABELS) as CalendarView[]).map((v) => (
                <button
                  key={v}
                  onClick={() => selectView(v)}
                  className={cn(
                    "flex w-full items-center px-3 py-2 text-left text-xs font-medium transition-colors hover:bg-border",
                    v === view ? "bg-border text-foreground" : "text-muted-foreground",
                  )}
                >
                  {VIEW_LABELS[v]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Day labels for time-grid views */}
      {dayLabelsForGrid && (
        <div className="grid" style={{ gridTemplateColumns: `4rem 1fr` }}>
          <div />
          <div className="grid border-b border-border" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
            {days.map((d, i) => {
              const isToday = isSameDay(d, today);
              return (
                <div
                  key={i}
                  className={cn(
                    "py-2 text-center text-xs",
                    isToday ? "font-bold text-foreground" : "font-medium text-muted-foreground",
                  )}
                >
                  <div>{DAY_LABELS[d.getDay()]}</div>
                  <div className={cn(
                    "mx-auto mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-xs",
                    isToday && "bg-foreground text-background",
                  )}>
                    {d.getDate()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === "month" && (
        <div className="grid grid-cols-7 border-b border-border">
          {DAY_LABELS.map((label) => (
            <div key={label} className="py-2 text-center text-xs font-medium text-muted-foreground">
              {label}
            </div>
          ))}
        </div>
      )}

      {/* Calendar body */}
      <div className={cn("pr-4", view !== "month" && "max-h-[600px] overflow-y-auto")}>
        {view !== "month" ? (
          <TimeGridView meetings={meetings} days={days} onMeetingClick={onMeetingClick} />
        ) : (
          <MonthView
            meetings={meetings}
            viewYear={viewYear}
            viewMonth={viewMonth}
            onMeetingClick={onMeetingClick}
          />
        )}
      </div>
    </div>
  );
}

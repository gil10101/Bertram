"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Meeting } from "@/types/meeting";
import { getProviders, PROVIDER_COLORS } from "./meeting-card";

type CalendarView = "week" | "month";

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

// --- Week View ---

function WeekView({
  meetings,
  weekStart,
  onMeetingClick,
}: {
  meetings: Meeting[];
  weekStart: Date;
  onMeetingClick?: (meeting: Meeting) => void;
}) {
  const today = new Date();
  const timeSlots = useMemo(() => getTimeSlots(), []);

  const weekDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  }, [weekStart]);

  const meetingsByDay = useMemo(() => {
    const map = new Map<number, Meeting[]>();
    for (let i = 0; i < 7; i++) map.set(i, []);
    for (const m of meetings) {
      const start = new Date(m.start_time);
      for (let i = 0; i < 7; i++) {
        if (isSameDay(start, weekDays[i])) {
          map.get(i)!.push(m);
          break;
        }
      }
    }
    return map;
  }, [meetings, weekDays]);

  return (
    <div className="flex overflow-hidden rounded-b-lg">
      {/* Time gutter */}
      <div className="w-16 flex-shrink-0 border-r border-border bg-muted/30">
        {timeSlots.map((label, i) => (
          <div
            key={label}
            className="flex items-start justify-end pr-2"
            style={{ height: `${ROW_HEIGHT}px`, ...(i === 0 ? { marginTop: 0 } : {}) }}
          >
            <span className="relative -top-2 text-[10px] text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* Day columns */}
      <div className="grid flex-1 grid-cols-7">
        {weekDays.map((day, dayIdx) => {
          const isToday = isSameDay(day, today);
          const dayMeetings = meetingsByDay.get(dayIdx) ?? [];

          return (
            <div
              key={dayIdx}
              className={cn(
                "relative border-r border-border last:border-r-0",
                isToday && "bg-primary/[0.03]",
              )}
            >
              {/* Hour grid lines */}
              {timeSlots.map((_, i) => (
                <div key={i} className="border-b border-border/40" style={{ height: `${ROW_HEIGHT}px` }} />
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
                    className="absolute inset-x-0.5 flex cursor-pointer overflow-hidden rounded bg-muted/60 text-foreground transition-opacity hover:opacity-80"
                    style={{ top: `${topPx}px`, height: `${heightPx}px` }}
                    title={`${m.title}\n${formatTime(start)} – ${formatTime(end)}`}
                  >
                    {/* Provider color stripe */}
                    <div className="flex w-1 flex-shrink-0 flex-col">
                      {providers.map((p) => (
                        <div
                          key={p}
                          className={cn("flex-1", PROVIDER_COLORS[p]?.bg ?? "bg-primary")}
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
          return <div key={`empty-${i}`} className="min-h-[96px] border-b border-r border-border/50 bg-muted/20 p-1" />;
        }

        const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const dayMeetings = meetingsByDate.get(dateKey) ?? [];
        const isToday = dateKey === todayKey;

        return (
          <div
            key={dateKey}
            className={cn(
              "min-h-[96px] border-b border-r border-border/50 p-1 transition-colors",
              isToday && "bg-primary/5",
            )}
          >
            <span
              className={cn(
                "mb-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs",
                isToday ? "bg-primary font-semibold text-primary-foreground" : "text-foreground",
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
                    className="flex cursor-pointer overflow-hidden rounded bg-muted/60 text-[10px] leading-tight text-foreground"
                    title={`${m.title}\n${formatTime(start)} – ${formatTime(end)}`}
                  >
                    <div className="flex w-0.5 flex-shrink-0 flex-col">
                      {providers.map((p) => (
                        <div key={p} className={cn("flex-1", PROVIDER_COLORS[p]?.bg ?? "bg-primary")} />
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

// --- Main Calendar Component ---

export function MeetingCalendar({ meetings, onMeetingClick }: MeetingCalendarProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [view, setView] = useState<CalendarView>("week");
  const [weekStart, setWeekStart] = useState(() => getWeekStart(today));

  const goToPrev = () => {
    if (view === "month") {
      if (viewMonth === 0) {
        setViewMonth(11);
        setViewYear((y) => y - 1);
      } else {
        setViewMonth((m) => m - 1);
      }
    } else {
      setWeekStart((ws) => {
        const d = new Date(ws);
        d.setDate(d.getDate() - 7);
        return d;
      });
    }
  };

  const goToNext = () => {
    if (view === "month") {
      if (viewMonth === 11) {
        setViewMonth(0);
        setViewYear((y) => y + 1);
      } else {
        setViewMonth((m) => m + 1);
      }
    } else {
      setWeekStart((ws) => {
        const d = new Date(ws);
        d.setDate(d.getDate() + 7);
        return d;
      });
    }
  };

  const goToToday = () => {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setWeekStart(getWeekStart(now));
  };

  const weekEnd = useMemo(() => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 6);
    return d;
  }, [weekStart]);

  const headerLabel =
    view === "month"
      ? `${MONTH_NAMES[viewMonth]} ${viewYear}`
      : `${weekStart.toLocaleDateString([], { month: "short", day: "numeric" })} – ${weekEnd.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}`;

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrev}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={goToNext}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <h3 className="text-sm font-semibold tracking-tight">{headerLabel}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Today
          </button>
          <div className="flex rounded-md border border-border">
            <button
              onClick={() => setView("week")}
              className={cn(
                "px-2.5 py-1 text-xs font-medium transition-colors",
                view === "week" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent",
              )}
            >
              Week
            </button>
            <button
              onClick={() => setView("month")}
              className={cn(
                "px-2.5 py-1 text-xs font-medium transition-colors",
                view === "month" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent",
              )}
            >
              Month
            </button>
          </div>
        </div>
      </div>

      {/* Day labels (shared for both views in week mode) */}
      {view === "week" && (
        <div className="grid grid-cols-[4rem_1fr]">
          <div />
          <div className="grid grid-cols-7 border-b border-border">
            {Array.from({ length: 7 }).map((_, i) => {
              const d = new Date(weekStart);
              d.setDate(d.getDate() + i);
              const isToday = isSameDay(d, today);
              return (
                <div
                  key={i}
                  className={cn(
                    "py-2 text-center text-xs",
                    isToday ? "font-bold text-primary" : "font-medium text-muted-foreground",
                  )}
                >
                  <div>{DAY_LABELS[i]}</div>
                  <div className={cn(
                    "mx-auto mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-xs",
                    isToday && "bg-primary text-primary-foreground",
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
      <div className={cn("pr-4", view === "week" && "max-h-[600px] overflow-y-auto")}>
        {view === "week" ? (
          <WeekView meetings={meetings} weekStart={weekStart} onMeetingClick={onMeetingClick} />
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

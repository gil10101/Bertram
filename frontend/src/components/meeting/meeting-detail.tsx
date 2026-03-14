"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  X,
  Clock,
  MapPin,
  Users,
  FileText,
  Pencil,
  Trash2,
  Forward,
  Reply,
  ReplyAll,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { Meeting } from "@/types/meeting";
import { getProviders, PROVIDER_COLORS } from "./meeting-card";

interface MeetingDetailProps {
  meeting: Meeting;
  onClose: () => void;
  onEdit: (meeting: Meeting) => void;
  onDelete: (meetingId: string) => Promise<void>;
  onForward: (meeting: Meeting) => void;
  onReply: (meeting: Meeting) => void;
  onReplyAll: (meeting: Meeting) => void;
}

export function MeetingDetail({
  meeting,
  onClose,
  onEdit,
  onDelete,
  onForward,
  onReply,
  onReplyAll,
}: MeetingDetailProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [attendeesExpanded, setAttendeesExpanded] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const start = new Date(meeting.start_time);
  const end = new Date(meeting.end_time);
  const dateStr = start.toLocaleDateString([], {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = `${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

  const durationMs = end.getTime() - start.getTime();
  const durationMin = Math.round(durationMs / 60000);
  const durationStr =
    durationMin >= 60
      ? `${Math.floor(durationMin / 60)}h ${durationMin % 60 ? `${durationMin % 60}m` : ""}`
      : `${durationMin}m`;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(meeting.id);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="dark fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 flex w-full max-w-md flex-col overflow-y-auto bg-background text-foreground shadow-xl" role="dialog" aria-modal="true" aria-label={meeting.title}>
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border p-5">
          <div className="flex-1 pr-4">
            <div className="mb-2 flex items-center gap-2">
              {getProviders(meeting).map((p) => {
                const colors = PROVIDER_COLORS[p] ?? PROVIDER_COLORS.bertram;
                return (
                  <span
                    key={p}
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                      colors.badge,
                    )}
                  >
                    {colors.label} Calendar
                  </span>
                );
              })}
            </div>
            <h2 className="text-xl font-semibold">{meeting.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-5 p-5">
          {/* Time */}
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{dateStr}</p>
              <p className="text-sm text-muted-foreground">
                {timeStr} ({durationStr})
              </p>
            </div>
          </div>

          {/* Location */}
          {meeting.location && (
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm">
                  {meeting.location.startsWith("http") ? (
                    <a
                      href={meeting.location}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      {meeting.location}
                    </a>
                  ) : (
                    meeting.location
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Attendees */}
          {meeting.attendees.length > 0 && (
            <div className="flex items-start gap-3">
              <Users className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <button
                  onClick={() => setAttendeesExpanded(!attendeesExpanded)}
                  className="flex items-center gap-1 text-sm font-medium"
                >
                  {meeting.attendees.length} attendee
                  {meeting.attendees.length !== 1 ? "s" : ""}
                  {attendeesExpanded ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </button>
                {attendeesExpanded && (
                  <ul className="mt-2 space-y-1.5">
                    {meeting.attendees.map((attendee, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-semibold uppercase">
                          {attendee.charAt(0)}
                        </div>
                        {attendee}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          {meeting.description && (
            <div className="flex items-start gap-3">
              <FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="mb-1 text-sm font-medium">Description</p>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {meeting.description}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 border-t border-border p-5">
          {meeting.attendees.length > 0 && (
            <>
              <button
                onClick={() => onReply(meeting)}
                className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
              >
                <Reply className="h-3.5 w-3.5" />
                Reply
              </button>
              {meeting.attendees.length > 1 && (
                <button
                  onClick={() => onReplyAll(meeting)}
                  className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                >
                  <ReplyAll className="h-3.5 w-3.5" />
                  Reply All
                </button>
              )}
            </>
          )}
          <button
            onClick={() => onForward(meeting)}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
          >
            <Forward className="h-3.5 w-3.5" />
            Forward
          </button>
          <button
            onClick={() => onEdit(meeting)}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
          <div className="flex-1" />
          {showConfirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Delete?</span>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-md bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Confirm"}
              </button>
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-accent"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="flex items-center gap-1.5 rounded-md border border-destructive/30 px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

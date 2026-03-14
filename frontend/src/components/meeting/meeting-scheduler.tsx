"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMeetings } from "@/hooks/use-meetings";
import { MeetingCard } from "./meeting-card";
import { MeetingCalendar } from "./meeting-calendar";
import { MeetingForm } from "./time-slot-picker";
import { MeetingDetail } from "./meeting-detail";
import { storeComposeData } from "@/components/email/email-compose";
import type { Meeting, MeetingCreateRequest } from "@/types/meeting";
import type { ComposeMode } from "@/types/email";

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

function buildMeetingBody(meeting: Meeting): string {
  const start = new Date(meeting.start_time);
  const end = new Date(meeting.end_time);
  return (
    `Meeting: ${meeting.title}\n` +
    `Date: ${start.toLocaleDateString()}\n` +
    `Time: ${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}\n` +
    (meeting.location ? `Location: ${meeting.location}\n` : "") +
    (meeting.attendees.length > 0
      ? `Attendees: ${meeting.attendees.join(", ")}\n`
      : "") +
    (meeting.description ? `\nDetails:\n${meeting.description}` : "")
  );
}

export function MeetingScheduler() {
  const router = useRouter();
  const { meetings, isLoading, createMeeting, updateMeeting, deleteMeeting } = useMeetings();
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [showForm, setShowForm] = useState(false);

  const upcomingMeetings = useMemo(() => {
    const now = new Date();
    return meetings
      .filter((m) => new Date(m.end_time) >= now)
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
      .slice(0, 6);
  }, [meetings]);

  const handleCreate = async (data: MeetingCreateRequest) => {
    await createMeeting(data);
    setShowForm(false);
  };

  const handleEdit = (meeting: Meeting) => {
    setSelectedMeeting(null);
    setEditingMeeting(meeting);
    setShowForm(true);
  };

  const handleUpdate = async (data: MeetingCreateRequest) => {
    if (!editingMeeting) return;
    await updateMeeting(editingMeeting.id, data);
    setEditingMeeting(null);
    setShowForm(false);
  };

  const handleDelete = async (meetingId: string) => {
    await deleteMeeting(meetingId);
  };

  const navigateToCompose = (meeting: Meeting, mode: ComposeMode) => {
    const body = buildMeetingBody(meeting);
    const prefix = mode === "forward" ? "Fwd" : "Re";
    const subject = `${prefix}: ${meeting.title}`;

    let to = "";
    let cc = "";

    if (mode === "reply") {
      to = meeting.attendees[0] ?? "";
    } else if (mode === "replyAll") {
      to = meeting.attendees.join(", ");
    }

    const quotedBody =
      mode === "forward"
        ? `\n\n---------- Forwarded Meeting ----------\n${body}`
        : `\n\n---------- Meeting Details ----------\n${body}`;

    storeComposeData({ mode, to, cc, subject, body: quotedBody });
    router.push("/compose");
  };

  const handleForward = (meeting: Meeting) => navigateToCompose(meeting, "forward");
  const handleReply = (meeting: Meeting) => navigateToCompose(meeting, "reply");
  const handleReplyAll = (meeting: Meeting) => navigateToCompose(meeting, "replyAll");

  const handleCancelForm = useCallback(() => {
    setEditingMeeting(null);
    setShowForm(false);
  }, []);

  useEffect(() => {
    if (!showForm) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCancelForm();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showForm, handleCancelForm]);

  if (isLoading) return <LoadingState />;

  return (
    <div className="flex flex-col gap-8">
      {/* Calendar view */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Calendar</h2>
          <button
            onClick={() => {
              setEditingMeeting(null);
              setShowForm(true);
            }}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            New Meeting
          </button>
        </div>
        <MeetingCalendar meetings={meetings} onMeetingClick={setSelectedMeeting} />
      </div>

      {/* Create/Edit form modal */}
      {showForm && (
        <div className="dark fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleCancelForm}
          />

          {/* Modal panel */}
          <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-background text-foreground p-4 shadow-xl" role="dialog" aria-modal="true" aria-label={editingMeeting ? "Edit Meeting" : "New Meeting"}>
            <MeetingForm
              onSubmit={editingMeeting ? handleUpdate : handleCreate}
              editingMeeting={editingMeeting}
              onCancel={handleCancelForm}
            />
          </div>
        </div>
      )}

      {/* Upcoming meetings list */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-foreground">Upcoming Meetings</h2>
        {upcomingMeetings.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming meetings</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {upcomingMeetings.map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                onClick={() => setSelectedMeeting(meeting)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Meeting detail panel */}
      {selectedMeeting && (
        <MeetingDetail
          meeting={selectedMeeting}
          onClose={() => setSelectedMeeting(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onForward={handleForward}
          onReply={handleReply}
          onReplyAll={handleReplyAll}
        />
      )}
    </div>
  );
}

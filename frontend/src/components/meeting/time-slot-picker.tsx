"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { Meeting, MeetingCreateRequest } from "@/types/meeting";

interface MeetingFormProps {
  onSubmit: (data: MeetingCreateRequest) => Promise<void>;
  editingMeeting?: Meeting | null;
  onCancel?: () => void;
}

export function MeetingForm({ onSubmit, editingMeeting, onCancel }: MeetingFormProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [attendees, setAttendees] = useState<string[]>([]);
  const [attendeeInput, setAttendeeInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingMeeting) {
      setTitle(editingMeeting.title);
      const start = new Date(editingMeeting.start_time);
      const end = new Date(editingMeeting.end_time);
      setDate(start.toISOString().slice(0, 10));
      setStartTime(start.toTimeString().slice(0, 5));
      setEndTime(end.toTimeString().slice(0, 5));
      setDescription(editingMeeting.description || "");
      setLocation(editingMeeting.location || "");
      setAttendees(editingMeeting.attendees || []);
    }
  }, [editingMeeting]);

  const resetForm = () => {
    setTitle("");
    setDate(new Date().toISOString().slice(0, 10));
    setStartTime("");
    setEndTime("");
    setDescription("");
    setLocation("");
    setAttendees([]);
    setAttendeeInput("");
  };

  const handleAddAttendee = () => {
    const email = attendeeInput.trim();
    if (email && !attendees.includes(email)) {
      setAttendees([...attendees, email]);
      setAttendeeInput("");
    }
  };

  const handleAttendeeKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddAttendee();
    }
  };

  const handleRemoveAttendee = (email: string) => {
    setAttendees(attendees.filter((a) => a !== email));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startTime || !endTime) return;

    const startDt = new Date(`${date}T${startTime}`);
    const endDt = new Date(`${date}T${endTime}`);

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        start_time: startDt.toISOString(),
        end_time: endDt.toISOString(),
        attendees,
        description: description.trim(),
        location: location.trim(),
      });
      if (!editingMeeting) resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          {editingMeeting ? "Edit Meeting" : "Schedule New Meeting"}
        </h3>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Title */}
      <div>
        <label htmlFor="meeting-title" className="mb-1 block text-sm font-medium">
          Title
        </label>
        <input
          id="meeting-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Meeting name"
          className={inputClass}
          required
        />
      </div>

      {/* Date + Time */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label htmlFor="meeting-date" className="mb-1 block text-sm font-medium">
            Date
          </label>
          <input
            id="meeting-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="meeting-start" className="mb-1 block text-sm font-medium">
            Start
          </label>
          <input
            id="meeting-start"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="meeting-end" className="mb-1 block text-sm font-medium">
            End
          </label>
          <input
            id="meeting-end"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <label htmlFor="meeting-location" className="mb-1 block text-sm font-medium">
          Location
        </label>
        <input
          id="meeting-location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Room, address, or link"
          className={inputClass}
        />
      </div>

      {/* Attendees */}
      <div>
        <label htmlFor="meeting-attendee" className="mb-1 block text-sm font-medium">
          Attendees
        </label>
        <div className="flex gap-2">
          <input
            id="meeting-attendee"
            type="email"
            value={attendeeInput}
            onChange={(e) => setAttendeeInput(e.target.value)}
            onKeyDown={handleAttendeeKeyDown}
            placeholder="Add email and press Enter"
            className={inputClass}
          />
          <button
            type="button"
            onClick={handleAddAttendee}
            className="shrink-0 rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-accent"
          >
            Add
          </button>
        </div>
        {attendees.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {attendees.map((email) => (
              <span
                key={email}
                className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs"
              >
                {email}
                <button
                  type="button"
                  onClick={() => handleRemoveAttendee(email)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="meeting-desc" className="mb-1 block text-sm font-medium">
          Description
        </label>
        <textarea
          id="meeting-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Meeting details..."
          rows={3}
          className={inputClass}
        />
      </div>

      {/* Submit */}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!title.trim() || !startTime || !endTime || isSubmitting}
          className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting
            ? editingMeeting
              ? "Saving..."
              : "Creating..."
            : editingMeeting
              ? "Save Changes"
              : "Create Meeting"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

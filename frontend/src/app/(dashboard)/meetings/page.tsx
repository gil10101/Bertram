"use client";

import { MeetingScheduler } from "@/components/meeting/meeting-scheduler";

export default function MeetingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold md:text-2xl">Meetings</h1>
      <MeetingScheduler />
    </div>
  );
}

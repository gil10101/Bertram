"use client";

import { MeetingScheduler } from "@/components/meeting/meeting-scheduler";

export default function MeetingsPage() {
  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Meetings</h1>
      <MeetingScheduler />
    </div>
    </div>
  );
}

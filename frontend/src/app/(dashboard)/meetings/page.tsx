"use client";

import { Suspense } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { MailSidebar } from "@/components/mail/mail-sidebar";
import { MeetingScheduler } from "@/components/meeting/meeting-scheduler";

function MeetingsContent() {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <div className="dark flex h-screen w-full overflow-hidden bg-sidebar">
        <MailSidebar />
        <div className="flex flex-1 min-w-0 gap-[2px] pr-1.5 py-1.5 pl-0">
          <div className="flex-1 min-w-0">
            <div className="h-full overflow-hidden rounded-xl bg-background">
              <div className="h-full overflow-y-auto p-4 md:p-6">
                <MeetingScheduler />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mobile layout
  return (
    <div className="dark flex h-screen w-full overflow-hidden bg-sidebar">
      <MailSidebar />
      <div className="flex flex-1 min-w-0 p-1 pl-0">
        <div className="flex-1 min-w-0">
          <div className="h-full overflow-hidden rounded-xl bg-background">
            <div className="h-full overflow-y-auto p-4">
              <MeetingScheduler />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MeetingsPage() {
  return (
    <Suspense>
      <MeetingsContent />
    </Suspense>
  );
}

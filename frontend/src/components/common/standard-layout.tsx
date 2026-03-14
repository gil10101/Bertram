"use client";

import { Sidebar } from "@/components/common/sidebar";
import { Topbar } from "@/components/common/topbar";

export function StandardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <div className="flex-1 overflow-hidden p-2 pt-0">
          <main className="h-full overflow-hidden rounded-2xl bg-card/90">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

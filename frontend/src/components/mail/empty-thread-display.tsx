"use client";

import { Mail } from "lucide-react";

export function EmptyThreadDisplay() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 bg-background text-muted-foreground">
      <Mail className="h-12 w-12 text-faint" />
      <p className="text-sm">Select an email to read</p>
    </div>
  );
}

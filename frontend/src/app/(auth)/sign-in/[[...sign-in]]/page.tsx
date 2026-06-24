"use client";

import { SignIn } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function SignInPage() {
  const { resolvedTheme } = useTheme();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <SignIn afterSignInUrl="/inbox" appearance={clerkAppearance(resolvedTheme === "dark")} />
    </div>
  );
}

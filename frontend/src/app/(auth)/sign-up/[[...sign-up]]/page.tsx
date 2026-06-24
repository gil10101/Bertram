"use client";

import { SignUp } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function SignUpPage() {
  const { resolvedTheme } = useTheme();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-[27rem]">
        <SignUp afterSignUpUrl="/inbox" appearance={clerkAppearance(resolvedTheme === "dark")} />
      </div>
    </div>
  );
}

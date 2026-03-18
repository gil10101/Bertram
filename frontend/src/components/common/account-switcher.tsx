"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { ChevronsUpDown, Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useConnectedProviders } from "@/hooks/use-connected-providers";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";

const PROVIDER_CONFIG: Record<
  string,
  { label: string; color: string; initial: string }
> = {
  gmail: { label: "Gmail", color: "#EA4335", initial: "G" },
  outlook: { label: "Outlook", color: "#0078D4", initial: "O" },
};

function UserAvatar({
  imageUrl,
  initial,
  size = "md",
}: {
  imageUrl?: string | null;
  initial: string;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-7 w-7" : "h-8 w-8";

  return imageUrl ? (
    <Image
      src={imageUrl}
      alt=""
      width={size === "sm" ? 28 : 32}
      height={size === "sm" ? 28 : 32}
      className={cn(dim, "shrink-0 rounded-full object-cover")}
    />
  ) : (
    <span
      className={cn(
        dim,
        "flex shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-foreground"
      )}
    >
      {initial}
    </span>
  );
}

/** Provider badge overlay on user avatar */
function ProviderAccountAvatar({
  provider,
  imageUrl,
  initial,
  size = "md",
}: {
  provider: string;
  imageUrl?: string | null;
  initial: string;
  size?: "sm" | "md";
}) {
  const config = PROVIDER_CONFIG[provider];
  const dim = size === "sm" ? "h-7 w-7" : "h-8 w-8";
  const badgeDim = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const badgeText = size === "sm" ? "text-[7px]" : "text-[8px]";

  return (
    <span className={cn(dim, "relative shrink-0")}>
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt=""
          width={size === "sm" ? 28 : 32}
          height={size === "sm" ? 28 : 32}
          className={cn(dim, "rounded-full object-cover")}
        />
      ) : (
        <span
          className={cn(
            dim,
            "flex items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-foreground"
          )}
        >
          {initial}
        </span>
      )}
      {config && (
        <span
          className={cn(
            badgeDim,
            badgeText,
            "absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full font-bold text-white ring-2 ring-sidebar"
          )}
          style={{ backgroundColor: config.color }}
        >
          {config.initial}
        </span>
      )}
    </span>
  );
}

export function AccountSwitcher() {
  const { providers, isLoading } = useConnectedProviders();
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const activeProvider = searchParams.get("provider") ?? "all";
  const userInitial =
    user?.fullName?.charAt(0)?.toUpperCase() ??
    user?.emailAddresses?.[0]?.emailAddress?.charAt(0)?.toUpperCase() ??
    "B";
  const userEmail = user?.emailAddresses?.[0]?.emailAddress ?? "";
  const userName = user?.fullName ?? "Bertram";
  const userImage = user?.imageUrl ?? null;

  const activeLabel =
    activeProvider === "all"
      ? userName
      : (PROVIDER_CONFIG[activeProvider]?.label ?? activeProvider);

  const handleSelect = (provider: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (provider === "all") {
      params.delete("provider");
    } else {
      params.set("provider", provider);
    }

    // Reset Gmail category when switching away
    if (provider !== "gmail") {
      params.delete("category");
    }

    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}`);
    setOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 px-4 py-4">
        <Skeleton className="h-8 w-8 shrink-0 rounded-full bg-sidebar-accent" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-24 bg-sidebar-accent" />
          <Skeleton className="h-3 w-32 bg-sidebar-accent" />
        </div>
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-3 px-4 py-4 text-left"
        >
          {activeProvider === "all" ? (
            <UserAvatar
              imageUrl={userImage}
              initial={userInitial}
              // shimmer
            />
          ) : (
            <ProviderAccountAvatar
              provider={activeProvider}
              imageUrl={userImage}
              initial={userInitial}
            />
          )}
          <div className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold text-sidebar-foreground">
              {activeLabel}
            </span>
            <span className="block truncate text-xs text-faint">
              {userEmail}
            </span>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-faint" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        alignOffset={8}
        sideOffset={-4}
        className="w-[232px] border-sidebar-border bg-sidebar p-1 shadow-xl"
      >
        {/* All accounts */}
        <button
          type="button"
          onClick={() => handleSelect("all")}
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors",
            activeProvider === "all"
              ? "bg-sidebar-accent"
              : "hover:bg-sidebar-accent/50"
          )}
        >
          <UserAvatar
            imageUrl={userImage}
            initial={userInitial}
            size="sm"
            // shimmer
          />
          <div className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-sidebar-foreground">
              {userName}
            </span>
            <span className="block truncate text-xs text-faint">
              All accounts
            </span>
          </div>
          {activeProvider === "all" && (
            <Check className="h-4 w-4 shrink-0 text-paprika" />
          )}
        </button>

        {/* Divider */}
        {providers.length > 0 && (
          <div className="my-1 border-t border-sidebar-border" />
        )}

        {/* Connected providers */}
        {providers.map((provider) => {
          const config = PROVIDER_CONFIG[provider];
          const isActive = activeProvider === provider;

          return (
            <button
              key={provider}
              type="button"
              onClick={() => handleSelect(provider)}
              className={cn(
                "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors",
                isActive
                  ? "bg-sidebar-accent"
                  : "hover:bg-sidebar-accent/50"
              )}
            >
              <ProviderAccountAvatar
                provider={provider}
                imageUrl={userImage}
                initial={userInitial}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-sidebar-foreground">
                  {config?.label ?? provider}
                </span>
                <span className="block truncate text-xs text-faint">
                  {userEmail}
                </span>
              </div>
              {isActive && (
                <Check className="h-4 w-4 shrink-0 text-paprika" />
              )}
            </button>
          );
        })}

        {/* Divider */}
        <div className="my-1 border-t border-sidebar-border" />

        {/* Add account */}
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            router.push("/settings");
          }}
          className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-faint transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-dashed border-sidebar-border">
            <Plus className="h-3.5 w-3.5" />
          </span>
          <span className="text-sm font-medium">Add account</span>
        </button>
      </PopoverContent>
    </Popover>
  );
}

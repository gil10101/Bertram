"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { Inbox, FileText, Calendar, Settings, Trash2, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMobileSidebar } from "./mobile-sidebar-provider";
import { useCompose } from "./compose-provider";
import { useUnreadCount } from "@/hooks/use-unread-count";

const navItems = [
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/inbox?view=drafts", label: "Drafts", icon: FileText },
  { href: "/inbox?folder=TRASH", label: "Bin", icon: Trash2 },
  { href: "/meetings", label: "Meetings", icon: Calendar },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isOpen, close } = useMobileSidebar();
  const { openCompose } = useCompose();
  const { user } = useUser();
  const unreadCount = useUnreadCount();

  const handleNewEmail = () => {
    close();
    if (pathname === "/inbox" || pathname.startsWith("/inbox/")) {
      openCompose();
    } else {
      router.push("/compose");
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-background transition-transform duration-300 ease-in-out md:static md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex min-w-0 items-center gap-3">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8",
                },
              }}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user?.fullName || "Bertram"}</p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.emailAddresses?.[0]?.emailAddress || ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close sidebar"
            className="rounded-md p-1 text-muted-foreground hover:text-foreground md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-4 pb-2">
          <button
            type="button"
            onClick={handleNewEmail}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            New email
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-4">
          {navItems.map(({ href, label, icon: Icon }) => {
            const [hrefPath, hrefQuery] = href.split("?");
            const isActive = hrefQuery
              ? pathname === hrefPath && new URLSearchParams(hrefQuery).get("view") === searchParams.get("view") && new URLSearchParams(hrefQuery).get("folder") === searchParams.get("folder")
              : (pathname === href || pathname.startsWith(`${href}/`)) && !searchParams.get("view") && !searchParams.get("folder");
            return (
              <Link
                key={href}
                href={href}
                onClick={close}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "border-l-2 border-paprika bg-accent text-accent-foreground"
                    : "border-l-2 border-transparent text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="flex-1">{label}</span>
                {href === "/inbox" && unreadCount > 0 && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="mt-auto">
            <Link
              href="/settings"
              onClick={close}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === "/settings" || pathname.startsWith("/settings/")
                  ? "border-l-2 border-paprika bg-accent text-accent-foreground"
                  : "border-l-2 border-transparent text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <Settings className="h-5 w-5 shrink-0" />
              <span className="flex-1">Settings</span>
            </Link>
          </div>
        </nav>
      </aside>
    </>
  );
}

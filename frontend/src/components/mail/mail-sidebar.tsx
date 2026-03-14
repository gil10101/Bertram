"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  Inbox,
  Star,
  FileText,
  Send,
  Archive,
  AlertCircle,
  Trash2,
  Settings,
  HelpCircle,
  MoreHorizontal,
  Mail,
  Calendar,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMobileSidebar } from "@/components/common/mobile-sidebar-provider";
import { useCompose } from "@/components/common/compose-provider";
import { useUnreadCount } from "@/hooks/use-unread-count";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  matchParams?: Record<string, string>;
  count?: number;
}

const coreNav: NavItem[] = [
  { icon: Inbox, label: "Inbox", href: "/inbox" },
  { icon: Star, label: "Favorites", href: "/inbox?view=starred", matchParams: { view: "starred" } },
  { icon: FileText, label: "Drafts", href: "/inbox?view=drafts", matchParams: { view: "drafts" } },
  { icon: Send, label: "Sent", href: "/inbox?folder=SENT", matchParams: { folder: "SENT" } },
  { icon: Calendar, label: "Meetings", href: "/meetings" },
];

const managementNav: NavItem[] = [
  { icon: Archive, label: "Archive", href: "/inbox?folder=archive", matchParams: { folder: "archive" } },
  { icon: AlertCircle, label: "Spam", href: "/inbox?folder=SPAM", matchParams: { folder: "SPAM" } },
  { icon: Trash2, label: "Bin", href: "/inbox?folder=TRASH", matchParams: { folder: "TRASH" } },
];

const bottomNav: NavItem[] = [
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: HelpCircle, label: "Support", href: "/settings" },
];

export function MailSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isOpen, close } = useMobileSidebar();
  const { openCompose } = useCompose();
  const { user } = useUser();
  const unreadCount = useUnreadCount();

  const isActive = (item: NavItem) => {
    // For items with matchParams, check pathname and params
    if (item.matchParams) {
      if (!pathname.startsWith("/inbox")) return false;
      return Object.entries(item.matchParams).every(
        ([key, val]) => searchParams.get(key) === val
      );
    }
    // For /inbox with no params, must be exact (no folder/view params)
    if (item.href === "/inbox") {
      return (
        pathname === "/inbox" &&
        !searchParams.get("folder") &&
        !searchParams.get("view")
      );
    }
    // For external pages like /meetings, /settings, /drafts
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  const handleNewEmail = () => {
    close();
    if (pathname === "/inbox" || pathname.startsWith("/inbox")) {
      openCompose();
    } else {
      router.push("/compose");
    }
  };

  const renderNavItem = (item: NavItem) => {
    const active = isActive(item);
    return (
      <Link
        key={item.label}
        href={item.href}
        onClick={close}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-150",
          active
            ? "bg-accent font-medium text-foreground"
            : "text-muted-foreground hover:bg-background"
        )}
      >
        <item.icon className="h-4 w-4" />
        <span>{item.label}</span>
        {item.label === "Inbox" && unreadCount > 0 && (
          <span className="ml-auto text-xs text-faint">
            {unreadCount > 999 ? "999+" : unreadCount}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={close}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full w-[240px] flex-col bg-sidebar md:static md:translate-x-0",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Account Header */}
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8",
                },
              }}
            />
            <div className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-foreground">
                {user?.fullName || "Bertram"}
              </span>
              <span className="block truncate text-xs text-faint">
                {user?.emailAddresses?.[0]?.emailAddress || ""}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            className="rounded p-1 text-faint hover:bg-accent md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* New Email Button */}
        <div className="px-3 pb-3">
          <button
            type="button"
            onClick={handleNewEmail}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-foreground py-2.5 text-sm font-medium text-sidebar"
          >
            <Mail className="h-4 w-4" />
            New email
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-2">
          <p className="px-2 pb-1 pt-3 text-[11px] font-medium uppercase tracking-wider text-faint">
            Core
          </p>
          {coreNav.map(renderNavItem)}

          <p className="px-2 pb-1 pt-4 text-[11px] font-medium uppercase tracking-wider text-faint">
            Management
          </p>
          {managementNav.map(renderNavItem)}
        </div>

        {/* Bottom Utilities */}
        <div className="px-2 py-2">
          {bottomNav.map(renderNavItem)}
        </div>
      </aside>
    </>
  );
}

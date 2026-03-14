"use client";

import { Zap, Tag, Users, Bell, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

export type GmailCategory =
  | "primary"
  | "promotions"
  | "social"
  | "updates"
  | "forums";

interface CategoryDef {
  id: GmailCategory;
  label: string;
  icon: React.ReactNode;
  activeColor: string;
}

const CATEGORIES: CategoryDef[] = [
  {
    id: "primary",
    label: "Primary",
    icon: <Zap className="h-4 w-4" />,
    activeColor: "bg-primary text-primary-foreground",
  },
  {
    id: "promotions",
    label: "Promotions",
    icon: <Tag className="h-4 w-4" />,
    activeColor: "bg-[#E11D48] text-white",
  },
  {
    id: "social",
    label: "Social",
    icon: <Users className="h-4 w-4" />,
    activeColor: "bg-[#2563EB] text-white",
  },
  {
    id: "updates",
    label: "Updates",
    icon: <Bell className="h-4 w-4" />,
    activeColor: "bg-[#7C3AED] text-white",
  },
  {
    id: "forums",
    label: "Forums",
    icon: <MessageSquare className="h-4 w-4" />,
    activeColor: "bg-[#0D9488] text-white",
  },
];

interface GmailCategoryTabsProps {
  activeCategory: GmailCategory;
  onCategoryChange: (category: GmailCategory) => void;
}

export function GmailCategoryTabs({
  activeCategory,
  onCategoryChange,
}: GmailCategoryTabsProps) {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <Tooltip key={cat.id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => onCategoryChange(cat.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? cat.activeColor
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  {cat.icon}
                  {isActive && (
                    <span className="animate-in fade-in-0 slide-in-from-left-1 duration-200">
                      {cat.label}
                    </span>
                  )}
                </button>
              </TooltipTrigger>
              {!isActive && (
                <TooltipContent side="bottom">
                  <p className="text-xs">{cat.label}</p>
                </TooltipContent>
              )}
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

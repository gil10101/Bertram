"use client";

import { useState, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import { Menu, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { useMobileSidebar } from "./mobile-sidebar-provider";
import { useSearch } from "./search-provider";

export function Topbar() {
  const { toggle } = useMobileSidebar();
  const { setQuery } = useSearch();
  const [input, setInput] = useState("");
  const debouncedInput = useDebounce(input, 350);

  useEffect(() => {
    setQuery(debouncedInput.trim());
  }, [debouncedInput, setQuery]);

  return (
    <header className="flex h-14 items-center justify-between gap-3 border-b bg-background px-4 md:h-16 md:gap-4 md:px-6">
      <button
        type="button"
        onClick={toggle}
        className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:text-foreground md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="relative flex min-w-0 flex-1 max-w-md">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search emails..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full pl-9 pr-8"
        />
        {input && (
          <button
            type="button"
            onClick={() => setInput("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <UserButton
        afterSignOutUrl="/"
        appearance={{
          elements: {
            avatarBox: "h-8 w-8 md:h-9 md:w-9",
          },
        }}
      />
    </header>
  );
}

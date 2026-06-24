"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DOC_GROUPS } from "./docs-content";

const DEFAULT_SLUG = DOC_GROUPS[0]?.items[0]?.slug;

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="docs-sidebar">
      {DOC_GROUPS.map((group) => (
        <div className="docs-group" key={group.label}>
          <div className="docs-group-label">{group.label}</div>
          {group.items.map((item) => {
            const href = `/docs/${item.slug}`;
            const active =
              pathname === href || (pathname === "/docs" && item.slug === DEFAULT_SLUG);
            return (
              <Link key={item.slug} href={href} className="docs-link" data-active={active}>
                {item.title}
              </Link>
            );
          })}
        </div>
      ))}
    </aside>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";

interface NavbarProps {
  isSignedIn: boolean;
}

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#numbers", label: "About" },
  { href: "#pricing", label: "Pricing" },
  { href: "#cta", label: "Contact" },
];

export function Navbar({ isSignedIn }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="fixed left-0 right-0 top-0 z-[100] flex items-center justify-between px-6 py-5 md:px-12 md:py-6">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-floral"
        >
          Bertram
        </Link>
        <div className="hidden gap-10 text-[0.8rem] uppercase tracking-[0.05em] md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-dust-400 transition-colors hover:text-floral"
            >
              {link.label}
            </a>
          ))}
        </div>
        <Link
          href={isSignedIn ? "/inbox" : "/sign-in"}
          className="hidden items-center gap-2 rounded-full border border-floral/20 px-5 py-2 text-[0.8rem] font-medium text-floral transition-all duration-300 hover:border-paprika hover:text-paprika md:inline-flex"
        >
          {isSignedIn ? "Open App" : "Sign In"} <span className="text-xs">&#8599;</span>
        </Link>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex flex-col gap-[5px] p-1 md:hidden"
          aria-label="Toggle menu"
        >
          <span
            className={`block h-px w-5 bg-floral transition-all duration-300 ${mobileOpen ? "translate-y-[6px] rotate-45" : ""}`}
          />
          <span
            className={`block h-px w-5 bg-floral transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block h-px w-5 bg-floral transition-all duration-300 ${mobileOpen ? "-translate-y-[6px] -rotate-45" : ""}`}
          />
        </button>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-[99] flex flex-col items-center justify-center gap-8 bg-carbon-500/98 backdrop-blur-xl transition-all duration-500 md:hidden ${
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={() => setMobileOpen(false)}
            className="text-2xl font-light tracking-[-0.02em] text-floral/80 transition-colors hover:text-floral"
          >
            {link.label}
          </a>
        ))}
        <Link
          href={isSignedIn ? "/inbox" : "/sign-in"}
          onClick={() => setMobileOpen(false)}
          className="mt-4 rounded-full border border-paprika/40 px-8 py-3 text-[0.8rem] font-medium uppercase tracking-[0.1em] text-floral transition-all duration-300 hover:bg-paprika hover:text-floral"
        >
          {isSignedIn ? "Open App" : "Sign In"} &#8599;
        </Link>
      </div>
    </>
  );
}

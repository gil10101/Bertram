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
      <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-5 md:px-12 md:py-6 flex items-center justify-between mix-blend-difference text-white">
        <Link href="/" className="text-lg font-semibold tracking-[-0.03em]">
          Bertram
        </Link>
        <div className="hidden md:flex gap-10 text-[0.8rem] uppercase tracking-[0.05em]">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="opacity-70 hover:opacity-100 transition-opacity"
            >
              {link.label}
            </a>
          ))}
        </div>
        <Link
          href={isSignedIn ? "/inbox" : "/sign-in"}
          className="text-[0.8rem] uppercase tracking-[0.05em] hidden md:inline-flex items-center gap-1"
        >
          <span>{isSignedIn ? "Open App" : "Sign In"} ↗</span>
        </Link>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex flex-col gap-[5px] p-1"
          aria-label="Toggle menu"
        >
          <span
            className={`block h-px w-5 bg-white transition-all duration-300 ${mobileOpen ? "translate-y-[6px] rotate-45" : ""}`}
          />
          <span
            className={`block h-px w-5 bg-white transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block h-px w-5 bg-white transition-all duration-300 ${mobileOpen ? "-translate-y-[6px] -rotate-45" : ""}`}
          />
        </button>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-[99] bg-carbon/95 backdrop-blur-md flex flex-col items-center justify-center gap-8 transition-all duration-500 md:hidden ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={() => setMobileOpen(false)}
            className="text-floral text-2xl font-light tracking-[-0.02em] opacity-80 hover:opacity-100 transition-opacity"
          >
            {link.label}
          </a>
        ))}
        <Link
          href={isSignedIn ? "/inbox" : "/sign-in"}
          onClick={() => setMobileOpen(false)}
          className="mt-4 text-[0.8rem] uppercase tracking-[0.1em] font-medium py-3 px-8 border border-floral/30 rounded-full text-floral hover:bg-floral hover:text-carbon transition-all duration-300"
        >
          {isSignedIn ? "Open App" : "Sign In"} ↗
        </Link>
      </div>
    </>
  );
}

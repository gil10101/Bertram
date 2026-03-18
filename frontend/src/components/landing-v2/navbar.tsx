"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BertramLogo } from "../common/bertram-logo";

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header>
      <nav
        data-state={menuOpen ? "active" : undefined}
        className="group fixed z-[100] w-full px-2"
      >
        <div
          className={cn(
            "mx-auto mt-2 max-w-6xl border border-transparent px-6 transition-all duration-300 lg:px-12",
            isScrolled &&
              "max-w-4xl rounded-2xl border-charcoal-400/20 bg-carbon-500/80 backdrop-blur-lg lg:px-5"
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            {/* Logo */}
            <div className="flex w-full justify-between lg:w-auto">
              <Link
                href="/"
                aria-label="home"
                className="flex items-center gap-1.5 text-lg font-bold tracking-tight text-floral"
              >
                <BertramLogo size={30} />
                Bertram
              </Link>

              {/* Mobile toggle */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={menuOpen ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="m-auto h-6 w-6 text-floral transition-all duration-200 group-data-[state=active]:scale-0 group-data-[state=active]:rotate-180 group-data-[state=active]:opacity-0" />
                <X className="absolute inset-0 m-auto h-6 w-6 -rotate-180 scale-0 text-floral opacity-0 transition-all duration-200 group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100" />
              </button>
            </div>

            {/* Desktop nav links (centered) */}
            <div className="absolute inset-0 m-auto hidden h-fit w-fit lg:block">
              <ul className="flex gap-8 text-sm">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="block text-dust-400 transition-colors duration-150 hover:text-floral"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Desktop right actions + Mobile menu */}
            <div className="mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border border-charcoal-400/20 bg-carbon-500 p-6 shadow-2xl shadow-black/20 group-data-[state=active]:block md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none lg:group-data-[state=active]:flex">
              {/* Mobile nav links */}
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {navLinks.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className="block text-dust-400 transition-colors duration-150 hover:text-floral"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action buttons */}
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                <Link
                  href={isSignedIn ? "/inbox" : "/sign-in"}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "inline-flex items-center justify-center rounded-xl border border-charcoal-400/20 px-4 py-2 text-sm font-medium text-dust-400 transition-all duration-300 hover:border-floral/30 hover:text-floral",
                    isScrolled && "lg:hidden"
                  )}
                >
                  {isSignedIn ? "Open App" : "Login"}
                </Link>

                <Link
                  href={isSignedIn ? "/inbox" : "/sign-up"}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "inline-flex items-center justify-center rounded-xl bg-paprika px-4 py-2 text-sm font-medium text-floral transition-colors duration-300 hover:bg-paprika-500",
                    isScrolled && "lg:hidden"
                  )}
                >
                  {isSignedIn ? "Open App" : "Get Started"}
                </Link>

                {/* Condensed button when scrolled */}
                <Link
                  href={isSignedIn ? "/inbox" : "/sign-up"}
                  className={cn(
                    "hidden items-center justify-center rounded-xl bg-paprika px-4 py-2 text-sm font-medium text-floral transition-colors duration-300 hover:bg-paprika-500",
                    isScrolled ? "lg:inline-flex" : "hidden"
                  )}
                >
                  {isSignedIn ? "Open App" : "Get Started"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

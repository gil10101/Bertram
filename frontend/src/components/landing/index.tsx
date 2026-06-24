"use client";

// Bertram landing page — editorial design imported from Claude Design.
// Theme (cream / dark) follows the browser via prefers-color-scheme (see landing.css).

import { Nav } from "./nav";
import { Hero } from "./hero";
import { Marquee } from "./marquee";
import { Manifesto } from "./manifesto";
import { Features } from "./features";
import { Product } from "./product";
import { Footer } from "./footer";

export function Landing({ isSignedIn = false }: { isSignedIn?: boolean }) {
  return (
    <div className="bertram-landing" style={{ position: "relative" }}>
      <div className="grain" aria-hidden="true" />
      <Nav isSignedIn={isSignedIn} />
      <Hero isSignedIn={isSignedIn} />
      <Marquee />
      <Manifesto />
      <Features />
      <Product />
      <Footer />
    </div>
  );
}

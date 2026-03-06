"use client";

import { useEffect, useRef } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dotRef.current || !ringRef.current) return;

    const dot: HTMLDivElement = dotRef.current;
    const ring: HTMLDivElement = ringRef.current;
    let mx = 0,
      my = 0,
      cx = 0,
      cy = 0,
      rx = 0,
      ry = 0;
    let rafId: number;

    function onMove(e: MouseEvent) {
      mx = e.clientX;
      my = e.clientY;
    }

    function enterHover() {
      dot.style.width = "48px";
      dot.style.height = "48px";
      ring.style.width = "64px";
      ring.style.height = "64px";
      ring.style.opacity = "0.2";
    }

    function leaveHover() {
      dot.style.width = "";
      dot.style.height = "";
      ring.style.width = "";
      ring.style.height = "";
      ring.style.opacity = "";
    }

    document.addEventListener("mousemove", onMove);
    const hoverEls = document.querySelectorAll("a, button");
    hoverEls.forEach((el) => {
      el.addEventListener("mouseenter", enterHover);
      el.addEventListener("mouseleave", leaveHover);
    });

    function tick() {
      cx += (mx - cx) * 0.15;
      cy += (my - cy) * 0.15;
      rx += (mx - rx) * 0.08;
      ry += (my - ry) * 0.08;
      dot.style.left = `${cx}px`;
      dot.style.top = `${cy}px`;
      ring.style.left = `${rx}px`;
      ring.style.top = `${ry}px`;
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
      hoverEls.forEach((el) => {
        el.removeEventListener("mouseenter", enterHover);
        el.removeEventListener("mouseleave", leaveHover);
      });
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        className="fixed w-4 h-4 rounded-full bg-paprika pointer-events-none z-[9999] mix-blend-difference -translate-x-1/2 -translate-y-1/2 transition-[width,height] duration-300 hidden md:block"
      />
      <div
        ref={ringRef}
        className="fixed w-10 h-10 rounded-full border border-paprika pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 transition-[width,height,opacity] duration-300 opacity-50 hidden md:block"
      />
    </>
  );
}

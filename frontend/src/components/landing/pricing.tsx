"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "@/lib/gsap";

const plans = [
  {
    name: "Free",
    price: "$0",
    featured: false,
    features: [
      "1 email account",
      "AI email summaries",
      "10 smart replies / day",
      "Community support",
    ],
  },
  {
    name: "Pro",
    price: "$9",
    featured: true,
    features: [
      "Unlimited accounts",
      "Unlimited AI replies",
      "Meeting scheduling",
      "Weekly inbox digests",
      "Priority support",
    ],
  },
  {
    name: "Team",
    price: "$19",
    featured: false,
    features: [
      "Everything in Pro",
      "Up to 10 members",
      "Shared inbox & labels",
      "Admin controls",
      "Dedicated support",
    ],
  },
];

export function Pricing() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils
        .toArray<HTMLElement>("[data-price-col]")
        .forEach((col, i) => {
          gsap.to(col, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            delay: i * 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: "[data-pricing-row]",
              start: "top 80%",
            },
          });
        });
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={ref}
      id="pricing"
      className="py-32 px-6 md:px-12 max-w-[1400px] mx-auto"
    >
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-24">
        <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-light tracking-[-0.04em] leading-none">
          Simple
          <br />
          <em className="font-serif italic">pricing.</em>
        </h2>
        <p className="text-[0.85rem] text-charcoal-300 max-w-[20rem] leading-[1.7] md:text-right">
          Start free. Upgrade when your inbox demands it. No hidden
          fees, cancel anytime.
        </p>
      </div>

      <div data-pricing-row="" className="grid grid-cols-1 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            data-price-col=""
            className={`py-10 px-6 md:py-12 md:px-10 border-b md:border-b-0 md:border-l border-dust/50 md:first:border-l-0 relative ${
              plan.featured
                ? "before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-carbon"
                : ""
            }`}
            style={{ opacity: 0, transform: "translateY(40px)" }}
          >
            <div className="text-[0.75rem] uppercase tracking-[0.15em] text-charcoal-300 mb-4">
              {plan.name}
            </div>
            <div className="text-[clamp(2.5rem,5vw,4rem)] font-light tracking-[-0.04em] leading-none">
              {plan.price}{" "}
              <span className="text-[0.85rem] text-charcoal-300 font-normal tracking-normal">
                /mo
              </span>
            </div>
            <ul className="mt-10">
              {plan.features.map((f) => (
                <li
                  key={f}
                  className="text-[0.85rem] text-charcoal-300 py-2.5 border-b border-dust/30 flex items-center gap-3"
                >
                  <span className="text-paprika text-[0.75rem]">→</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/sign-up"
              className="inline-block mt-10 text-[0.8rem] uppercase tracking-[0.1em] font-medium pb-1 border-b border-carbon hover:border-paprika hover:text-paprika transition-colors"
            >
              Get started
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

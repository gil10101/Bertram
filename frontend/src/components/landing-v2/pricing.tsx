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
      className="mx-auto max-w-[1400px] px-6 py-32 md:px-12"
    >
      <div className="mb-24 flex flex-col items-start justify-between gap-6 md:flex-row">
        <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-light leading-none tracking-[-0.04em] text-floral">
          Simple
          <br />
          <span className="italic text-paprika">pricing.</span>
        </h2>
        <p className="max-w-[20rem] text-[0.85rem] leading-[1.7] text-dust-400 md:text-right">
          Start free. Upgrade when your inbox demands it. No hidden fees, cancel
          anytime.
        </p>
      </div>

      <div data-pricing-row="" className="grid grid-cols-1 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            data-price-col=""
            className={`relative border-b px-6 py-10 transition-all duration-300 hover:scale-[1.01] md:border-b-0 md:border-l md:px-10 md:py-12 md:first:border-l-0 ${
              plan.featured
                ? "border-charcoal-400/30 bg-gradient-to-b from-paprika/5 to-transparent before:absolute before:left-0 before:right-0 before:top-0 before:h-0.5 before:bg-paprika hover:shadow-[0_0_30px_rgba(235,94,40,0.08)]"
                : "border-charcoal-400/30 hover:shadow-[0_0_20px_rgba(255,252,242,0.03)]"
            }`}
            style={{ opacity: 0, transform: "translateY(40px)" }}
          >
            <div className="mb-4 text-[0.75rem] uppercase tracking-[0.15em] text-dust-400">
              {plan.name}
            </div>
            <div className="text-[clamp(2.5rem,5vw,4rem)] font-light leading-none tracking-[-0.04em] text-floral">
              {plan.price}{" "}
              <span className="text-[0.85rem] font-normal tracking-normal text-dust-400">
                /mo
              </span>
            </div>
            <ul className="mt-10">
              {plan.features.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-3 border-b border-charcoal-400/20 py-2.5 text-[0.85rem] text-dust-400"
                >
                  <span className="text-[0.75rem] text-paprika">&#8594;</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/sign-up"
              className="mt-10 inline-block border-b border-floral/30 pb-1 text-[0.8rem] font-medium uppercase tracking-[0.1em] text-floral transition-colors hover:border-paprika hover:text-paprika"
            >
              Get started
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

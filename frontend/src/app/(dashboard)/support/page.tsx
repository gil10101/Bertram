"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { BookOpen, Bug, Zap, ChevronDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { MailSidebar } from "@/components/mail/mail-sidebar";

const ACTION_CARDS = [
  {
    icon: Bug,
    title: "Report a Bug",
    description: "Found something broken? Tell us what happened and we'll fix it fast.",
    href: "/report-bug",
  },
  {
    icon: Zap,
    title: "Feature Request",
    description: "Have an idea that would make Bertram better? We read every suggestion.",
    href: "/feature-request",
  },
];

const FAQ_ITEMS = [
  {
    question: "How do I connect my Gmail account?",
    answer:
      "Go to Settings → Connected Accounts and click Connect. You'll be redirected to Google to authorize Bertram.",
  },
  {
    question: "Is my email data stored on Bertram's servers?",
    answer:
      "Bertram fetches emails directly from your provider in real time. We cache metadata briefly to power features like prioritization, but we never store your full email content permanently.",
  },
  {
    question: "How does AI prioritization work?",
    answer:
      "Bertram uses Claude (Anthropic's AI) to classify each email as high, medium, or low priority based on sender, subject, and content signals. No data is used to train any AI models.",
  },
  {
    question: "Can I use Bertram with multiple email accounts?",
    answer:
      "Yes — connect both Gmail and Outlook from Settings. Use the account switcher in the sidebar to filter your inbox by account.",
  },
  {
    question: "What keyboard shortcuts are available?",
    answer:
      "Press ? anywhere in the app to open the keyboard shortcuts reference.",
  },
  {
    question: "How do I disconnect an account?",
    answer:
      "Go to Settings → Connected Accounts and click Disconnect next to the provider you want to remove.",
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-medium text-foreground transition-colors hover:text-foreground/80"
      >
        {question}
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-200",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <p className="pb-4 text-sm leading-relaxed text-muted-foreground">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

function SupportBody() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-foreground md:mb-8 md:text-3xl">
        Support
      </h1>

      <div className="flex flex-col gap-8">
        {/* Get in touch */}
        <section>
          <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Get in touch
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {ACTION_CARDS.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="group rounded-lg border border-border bg-card px-4 py-3.5 transition-colors hover:border-paprika/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-paprika/10">
                    <card.icon className="h-4 w-4 text-paprika" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{card.title}</p>
                    <p className="text-xs text-muted-foreground">{card.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Documentation — full-width bar */}
          <Link
            href="/docs"
            className="group mt-3 flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3.5 transition-colors hover:border-paprika/50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-paprika/10">
                <BookOpen className="h-4 w-4 text-paprika" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">Documentation</p>
                <p className="text-xs text-muted-foreground">
                  Guides for connecting accounts, AI features, and keyboard shortcuts.
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Frequently Asked Questions
          </h2>
          <div className="rounded-lg border border-border bg-card px-4">
            {FAQ_ITEMS.map((item) => (
              <FaqItem
                key={item.question}
                question={item.question}
                answer={item.answer}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function SupportContent() {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-sidebar text-foreground">
        <MailSidebar />
        <div className="flex flex-1 min-w-0 gap-[2px] pr-1.5 py-1.5 pl-0">
          <div className="flex-1 min-w-0">
            <div className="h-full overflow-hidden rounded-xl bg-background">
              <div className="h-full overflow-y-auto p-4 md:p-6">
                <SupportBody />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-sidebar text-foreground">
      <MailSidebar />
      <div className="flex flex-1 min-w-0 p-1 pl-0">
        <div className="flex-1 min-w-0">
          <div className="h-full overflow-hidden rounded-xl bg-background">
            <div className="h-full overflow-y-auto p-4">
              <SupportBody />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SupportPage() {
  return (
    <Suspense>
      <SupportContent />
    </Suspense>
  );
}

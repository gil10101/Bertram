"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth, useUser } from "@clerk/nextjs";
import { Bug, Zap, Check, ArrowLeft } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { createApiClient } from "@/lib/api-client";
import { useMediaQuery } from "@/hooks/use-media-query";
import { MailSidebar } from "@/components/mail/mail-sidebar";

export type FeedbackType = "bug" | "feature";

type SelectField = { name: "severity" | "area" | "category" | "importance"; label: string; options: string[] };

const CONFIG: Record<
  FeedbackType,
  {
    icon: typeof Bug;
    heading: string;
    subtitle: string;
    titleLabel: string;
    titlePlaceholder: string;
    descLabel: string;
    descPlaceholder: string;
    fieldA: SelectField;
    fieldB: SelectField;
    submitLabel: string;
    successTitle: string;
    successBody: string;
  }
> = {
  bug: {
    icon: Bug,
    heading: "Report a Bug",
    subtitle: "Found something broken? Tell us what happened and we'll get on it.",
    titleLabel: "Summary",
    titlePlaceholder: "Short description of the problem",
    descLabel: "What happened?",
    descPlaceholder:
      "Steps to reproduce, what you expected, and what actually happened. Include the page or feature.",
    fieldA: { name: "severity", label: "Severity", options: ["Low", "Medium", "High", "Critical"] },
    fieldB: {
      name: "area",
      label: "Area",
      options: ["Inbox", "Compose", "Scheduling", "Search", "Settings", "Other"],
    },
    submitLabel: "Submit bug report",
    successTitle: "Bug report received",
    successBody: "Thanks for flagging it. We review every report and will look into this.",
  },
  feature: {
    icon: Zap,
    heading: "Feature Request",
    subtitle: "Have an idea that would make Bertram better? We read every suggestion.",
    titleLabel: "Title",
    titlePlaceholder: "What would you like Bertram to do?",
    descLabel: "Describe the idea",
    descPlaceholder:
      "What problem would this solve for you? How do you imagine it working?",
    fieldA: {
      name: "category",
      label: "Category",
      options: ["AI", "Integrations", "UI & UX", "Performance", "Other"],
    },
    fieldB: {
      name: "importance",
      label: "Importance",
      options: ["Nice to have", "Important", "Critical"],
    },
    submitLabel: "Submit request",
    successTitle: "Request received",
    successBody: "Thanks for the idea. It's on our radar — we read every request.",
  },
};

function FeedbackForm({ type }: { type: FeedbackType }) {
  const cfg = CONFIG[type];
  const { getToken } = useAuth();
  const { user } = useUser();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [valueA, setValueA] = useState(cfg.fieldA.options[0]);
  const [valueB, setValueB] = useState(cfg.fieldB.options[0]);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const email = user?.primaryEmailAddress?.emailAddress ?? "";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Please fill in both fields.");
      setStatus("error");
      return;
    }
    setStatus("submitting");
    setError(null);
    try {
      const api = createApiClient(getToken);
      await api.post("/feedback", {
        type,
        title: title.trim(),
        description: description.trim(),
        [cfg.fieldA.name]: valueA,
        [cfg.fieldB.name]: valueB,
      });
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-paprika/10">
          <Check className="h-6 w-6 text-paprika" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">{cfg.successTitle}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{cfg.successBody}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/support" className={buttonVariants({ variant: "outline", size: "sm" })}>
            Back to Support
          </Link>
          <Button
            size="sm"
            onClick={() => {
              setTitle("");
              setDescription("");
              setValueA(cfg.fieldA.options[0]);
              setValueB(cfg.fieldB.options[0]);
              setStatus("idle");
            }}
          >
            Submit another
          </Button>
        </div>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">{cfg.titleLabel}</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={cfg.titlePlaceholder}
          className={inputCls}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[cfg.fieldA, cfg.fieldB].map((field, i) => (
          <div key={field.name}>
            <label className="mb-1.5 block text-sm font-medium text-foreground">{field.label}</label>
            <select
              value={i === 0 ? valueA : valueB}
              onChange={(e) => (i === 0 ? setValueA(e.target.value) : setValueB(e.target.value))}
              className={inputCls}
            >
              {field.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">{cfg.descLabel}</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={cfg.descPlaceholder}
          rows={6}
          className={inputCls + " resize-y"}
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          {email ? `Submitting as ${email}` : "Submitting from your account"}
        </p>
        <Button type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? "Submitting…" : cfg.submitLabel}
        </Button>
      </div>
    </form>
  );
}

function FeedbackBody({ type }: { type: FeedbackType }) {
  const cfg = CONFIG[type];
  const Icon = cfg.icon;
  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/support"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Support
      </Link>

      <div className="mb-8 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-paprika/10">
          <Icon className="h-5 w-5 text-paprika" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{cfg.heading}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{cfg.subtitle}</p>
        </div>
      </div>

      <FeedbackForm type={type} />
    </div>
  );
}

export function FeedbackPage({ type }: { type: FeedbackType }) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <div className="flex h-screen w-full overflow-hidden bg-sidebar text-foreground">
      <MailSidebar />
      <div className={isDesktop ? "flex flex-1 min-w-0 gap-[2px] pr-1.5 py-1.5 pl-0" : "flex flex-1 min-w-0 p-1 pl-0"}>
        <div className="flex-1 min-w-0">
          <div className="h-full overflow-hidden rounded-xl bg-background">
            <div className={isDesktop ? "h-full overflow-y-auto p-4 md:p-6" : "h-full overflow-y-auto p-4"}>
              <FeedbackBody type={type} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

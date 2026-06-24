import type { ReactNode } from "react";

export type DocPage = {
  slug: string;
  title: string;
  description?: string;
  body: ReactNode;
};

export type DocGroup = {
  label: string;
  items: DocPage[];
};

/** Callout box for docs prose. */
export function Callout({ label = "Note", children }: { label?: string; children: ReactNode }) {
  return (
    <div className="doc-callout">
      <div className="doc-callout-label">{label}</div>
      {children}
    </div>
  );
}

// NOTE: Bodies are plain JSX styled by `.doc-prose` (see docs.css). Use
// <p>, <h2>, <h3>, <ul>/<li>, <strong>, <a>, <code>, and <Callout>.
export const DOC_GROUPS: DocGroup[] = [
  {
    label: "Getting started",
    items: [
      {
        slug: "welcome",
        title: "Welcome to Bertram",
        description: "What Bertram is, and the fastest path to a calmer inbox.",
        body: (
          <>
            <p>
              <strong>Bertram</strong> is an AI email manager. It connects to your Gmail or Outlook
              account, reads your threads, and does the busywork for you — summarizing long
              conversations, drafting replies in your voice, prioritizing what matters, and booking
              meetings without the back-and-forth.
            </p>
            <p>
              These docs explain how Bertram works and how to get the most out of it. If you are just
              starting, follow the three pages in this section in order.
            </p>
            <h2>The 60-second version</h2>
            <ul>
              <li>
                <strong>Connect an account.</strong> Authorize Gmail or Outlook from{" "}
                <a href="/settings">Settings</a> — Bertram reads your mail directly from your
                provider.
              </li>
              <li>
                <strong>Open your inbox.</strong> Bertram ranks threads by priority and writes a
                three-line summary for anything long.
              </li>
              <li>
                <strong>Let it draft and schedule.</strong> Pick a suggested reply, or let Bertram
                propose meeting times straight from the thread.
              </li>
            </ul>
            <Callout label="Looking for how-to">
              These pages explain the <em>why</em>. For step-by-step walkthroughs, jump to{" "}
              <a href="/docs/connect-account">Connect an account</a>.
            </Callout>
          </>
        ),
      },
      {
        slug: "connect-account",
        title: "Connect an account",
        description: "Authorize Gmail or Outlook so Bertram can read and send on your behalf.",
        body: (
          <>
            <p>
              Bertram works on top of your existing mailbox — it does not replace your email address
              or move your mail anywhere. To get started, you authorize Bertram to access your Gmail
              or Outlook account using OAuth, the same secure sign-in flow you have used to connect
              other apps to Google or Microsoft.
            </p>
            <h2>Connecting your mailbox</h2>
            <ol>
              <li>
                Open <a href="/settings">Settings</a> and find the{" "}
                <strong>Connected Accounts</strong> section.
              </li>
              <li>
                Choose <strong>Gmail</strong> or <strong>Outlook</strong>. You will be redirected to
                Google or Microsoft to sign in.
              </li>
              <li>
                Review the permissions and approve. You are sent back to Bertram, and your inbox
                begins loading within a few seconds.
              </li>
            </ol>
            <p>
              The OAuth grant lets Bertram read your messages so it can summarize and prioritize
              them, and send messages so it can deliver the replies you approve. You can revoke
              access at any time — from Bertram's <a href="/settings">Settings</a>, or directly from
              your Google or Microsoft account security page.
            </p>
            <Callout label="Multiple accounts">
              You can connect more than one mailbox. Bertram keeps each account's threads, labels,
              and drafts separate, so a work inbox and a personal inbox never bleed together.
            </Callout>
          </>
        ),
      },
      {
        slug: "your-inbox",
        title: "Your inbox",
        description: "How to read, triage, and act on mail in the Bertram inbox.",
        body: (
          <>
            <p>
              Your <a href="/inbox">inbox</a> is where you will spend most of your time. Instead of a
              flat, reverse-chronological list, Bertram ranks threads so the messages that need you
              rise to the top. Each thread shows its priority, any labels it has been given, and — for
              longer conversations — a short AI summary so you know what it is about before you open
              it.
            </p>
            <h2>Triaging quickly</h2>
            <p>
              Work top-down. Bertram surfaces high-priority threads first, so clearing those gives
              you the most relief for the least effort. Open a thread to read it in full, reply, or
              archive it. When you reply, Bertram offers a draft you can accept, edit, or ignore.
            </p>
            <h2>Finding anything</h2>
            <p>
              Press <code>⌘K</code> anywhere to open search. You can search across senders, subjects,
              and message content, then jump straight to a thread. For a complete list of shortcuts,
              press <code>?</code> at any time.
            </p>
            <Callout label="Tip">
              You do not have to read in order. If something is genuinely low priority, archive it
              with a single keystroke and move on — Bertram learns from what you keep and what you
              clear.
            </Callout>
          </>
        ),
      },
    ],
  },
  {
    label: "Concepts",
    items: [
      {
        slug: "overview",
        title: "Overview",
        description: "The mental model behind Bertram and how its pieces fit together.",
        body: (
          <>
            <p>
              Bertram sits between you and your mailbox. Your mail stays where it lives — in Gmail or
              Outlook — and Bertram acts as an intelligent layer on top: reading what arrives,
              understanding it, and helping you respond. Nothing about your underlying email account
              changes.
            </p>
            <h2>The four things Bertram does</h2>
            <ul>
              <li>
                <strong>Summarizes</strong> long threads into a three-line gist so you do not have to
                scroll through a dozen replies.
              </li>
              <li>
                <strong>Drafts</strong> replies in your voice, ready to accept or edit.
              </li>
              <li>
                <strong>Prioritizes</strong> every thread as high, medium, or low so your attention
                goes where it matters.
              </li>
              <li>
                <strong>Schedules</strong> meetings by detecting requests and proposing times that
                fit your calendar.
              </li>
            </ul>
            <p>
              These are explored in detail under <a href="/docs/summaries">Features</a>. The pages
              that follow here cover the ideas underneath: how the system works end to end, how
              prioritization decides what matters, and how your data is handled.
            </p>
          </>
        ),
      },
      {
        slug: "how-bertram-works",
        title: "How Bertram works",
        description: "From your mailbox to the AI and back, in plain terms.",
        body: (
          <>
            <p>
              When you open Bertram, it fetches your messages directly from Gmail or Outlook in real
              time using the access you granted. It does not keep a permanent copy of your mailbox.
              Lightweight metadata — things like which threads exist and their priority — is cached
              briefly so the inbox feels fast, but the full content of your email is not stored
              permanently.
            </p>
            <h2>Where the intelligence comes from</h2>
            <p>
              Bertram uses Anthropic's Claude models for the AI work: summarizing threads, drafting
              replies, and classifying priority. When you ask for a summary or a draft, the relevant
              message content is sent to the model, the result comes back, and Bertram shows it to
              you. Your email is never used to train AI models.
            </p>
            <h2>The pieces under the hood</h2>
            <p>
              A web app handles everything you see and interact with. A backend service talks to your
              email provider and to Claude, and coordinates summaries, drafts, prioritization, and
              scheduling. Sign-in is handled by a dedicated authentication provider so your Bertram
              account is kept separate from your mailbox credentials.
            </p>
            <Callout label="Real-time, not a mirror">
              Because Bertram reads from your provider on demand, what you see in Bertram reflects
              your actual mailbox — there is no separate inbox to keep in sync.
            </Callout>
          </>
        ),
      },
      {
        slug: "ai-prioritization",
        title: "AI prioritization",
        description: "How Bertram decides what is high, medium, or low priority.",
        body: (
          <>
            <p>
              The point of prioritization is simple: spend your attention on the few threads that
              truly need it, and skim or skip the rest. Bertram uses Claude to read each incoming
              thread and classify it as <strong>high</strong>, <strong>medium</strong>, or{" "}
              <strong>low</strong> priority, then orders your <a href="/inbox">inbox</a> so the
              important things come first.
            </p>
            <h2>What the model weighs</h2>
            <p>
              Bertram considers the substance of a message rather than just its sender — whether it
              asks something of you, whether it is time-sensitive, whether it looks like a real
              person versus a newsletter or automated notice, and how it relates to conversations you
              are already part of. A direct question from a colleague about a deadline ranks higher
              than a promotional digest.
            </p>
            <h2>Reading the signal</h2>
            <ul>
              <li>
                <strong>High</strong> — likely needs a reply or a decision soon.
              </li>
              <li>
                <strong>Medium</strong> — worth seeing, but not urgent.
              </li>
              <li>
                <strong>Low</strong> — informational, promotional, or safe to batch through later.
              </li>
            </ul>
            <Callout label="It is a guide, not a verdict">
              Priority is a suggestion to help you triage faster, not a hard rule. You stay in
              control — open, reply to, or archive anything regardless of where Bertram placed it.
            </Callout>
          </>
        ),
      },
      {
        slug: "privacy",
        title: "Privacy & data",
        description: "What Bertram accesses, what it keeps, and what it never does.",
        body: (
          <>
            <p>
              Bertram is built to help with your email without hoarding it. Your mail is read from
              your provider in real time and used to do the job you asked for — summarize, draft,
              prioritize, schedule — and not for anything else.
            </p>
            <h2>What Bertram stores</h2>
            <p>
              Email content is fetched on demand and is <strong>not stored permanently</strong>.
              Bertram caches lightweight metadata briefly so your inbox loads quickly, but it does not
              keep a lasting archive of your message bodies.
            </p>
            <h2>What Bertram never does</h2>
            <ul>
              <li>
                <strong>Your data is never used to train AI models.</strong> Sending a thread to
                Claude for a summary or draft does not feed any training process.
              </li>
              <li>
                It does not sell or share your email content with third parties for advertising.
              </li>
            </ul>
            <h2>Staying in control</h2>
            <p>
              You granted Bertram access through OAuth, and you can withdraw it whenever you like —
              from <a href="/settings">Settings</a> or directly in your Google or Microsoft account.
              Disconnecting an account stops Bertram from reading that mailbox. If anything looks off,{" "}
              <a href="/support">reach out to support</a>.
            </p>
          </>
        ),
      },
    ],
  },
  {
    label: "Features",
    items: [
      {
        slug: "summaries",
        title: "Thread summaries",
        description: "Turn a long back-and-forth into a three-line gist.",
        body: (
          <>
            <p>
              Long threads are where time disappears — a dozen replies, quoted text, people added and
              dropped. Bertram reads the whole conversation and writes a short summary, a three-line
              gist, that captures what the thread is about and what, if anything, is being asked of
              you.
            </p>
            <h2>Where summaries show up</h2>
            <p>
              In your <a href="/inbox">inbox</a>, longer threads carry a gist inline so you can decide
              whether to open them. Inside a thread, the summary sits at the top so you get the
              context before diving into individual messages.
            </p>
            <p>
              Summaries are generated by Claude from the actual thread content at the moment you view
              it. They are meant to orient you quickly — for anything that matters, the full
              conversation is always one click away.
            </p>
            <Callout label="Best for noisy threads">
              Summaries shine on group threads and long replies. A two-line message does not need a
              gist, so Bertram does not force one.
            </Callout>
          </>
        ),
      },
      {
        slug: "smart-replies",
        title: "Smart replies",
        description: "Drafts written in your voice, ready to accept or edit.",
        body: (
          <>
            <p>
              When a thread needs a response, Bertram drafts one for you. The goal is not a generic
              auto-reply — it is a draft that sounds like <em>you</em>, picking up on the tone and
              substance of the conversation so the reply fits naturally.
            </p>
            <h2>How to use a draft</h2>
            <ul>
              <li>
                <strong>Accept it</strong> if it says what you would have said.
              </li>
              <li>
                <strong>Edit it</strong> to adjust the wording, add a detail, or change the tone.
              </li>
              <li>
                <strong>Ignore it</strong> and write your own — the draft is only ever a starting
                point.
              </li>
            </ul>
            <p>
              Drafts are generated from the thread's content using Claude. Nothing is sent on your
              behalf without your say-so: you review and approve before a reply goes out. Press{" "}
              <code>r</code> in a thread to start a reply.
            </p>
            <Callout label="You always have the last word">
              Bertram writes the first draft; you decide what actually gets sent. Treat its
              suggestion as a fast head start, not a finished email.
            </Callout>
          </>
        ),
      },
      {
        slug: "scheduling",
        title: "Scheduling & meetings",
        description: "Detect meeting requests and propose times without the back-and-forth.",
        body: (
          <>
            <p>
              Scheduling is one of email's most tedious chores — three messages just to agree on a
              time. Bertram watches for meeting requests in your threads and helps you resolve them
              quickly by proposing times and turning an agreed slot into a real meeting.
            </p>
            <h2>How it works</h2>
            <p>
              When Bertram detects that a thread is trying to set up a meeting, it surfaces that and
              can propose times to offer. Once a time is agreed, the meeting can be scheduled so it
              lands on your calendar instead of staying buried in your inbox.
            </p>
            <h2>The meetings view</h2>
            <p>
              The <a href="/meetings">meetings</a> view gives you a calendar-style look at what is
              coming up, so scheduling and seeing your day live in the same place rather than scattered
              across email and a separate calendar app.
            </p>
            <Callout label="Less ping-pong">
              The win here is fewer round trips. Instead of manually checking your calendar and typing
              out options, you let Bertram propose and confirm.
            </Callout>
          </>
        ),
      },
      {
        slug: "labels",
        title: "Labels & organization",
        description: "Keep your inbox structured with labels alongside priority.",
        body: (
          <>
            <p>
              Priority tells you what to look at next; labels tell you what something <em>is</em>.
              Together they keep your <a href="/inbox">inbox</a> organized without forcing you into a
              rigid folder system. Threads can carry labels that group related conversations so you
              can scan or filter by topic.
            </p>
            <h2>Using labels and search</h2>
            <p>
              Labels appear on threads in the inbox, so a glance tells you the shape of what is
              waiting. Combined with search — press <code>⌘K</code> to open it — you can quickly pull
              up everything in a given area without hunting through dates.
            </p>
            <p>
              Think of labels and priority as two complementary lenses: priority answers "what is
              urgent," labels answer "what is this about." Most people lean on priority for daily
              triage and labels when they need to find or batch a particular kind of mail.
            </p>
            <Callout label="Pair with shortcuts">
              Organizing is faster from the keyboard. See{" "}
              <a href="/docs/keyboard-shortcuts">Keyboard shortcuts</a> for the moves that speed up
              triage.
            </Callout>
          </>
        ),
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        slug: "settings",
        title: "Settings",
        description: "Connected accounts, preferences, and where to manage your account.",
        body: (
          <>
            <p>
              <a href="/settings">Settings</a> is your control panel. It is where you connect and
              disconnect mailboxes, manage how Bertram behaves, and find your account details.
            </p>
            <h2>Connected accounts</h2>
            <p>
              The <strong>Connected Accounts</strong> section is the most important part of Settings.
              From here you authorize Gmail or Outlook, see which mailboxes Bertram has access to, and
              revoke access at any time. Disconnecting an account immediately stops Bertram from
              reading that mailbox. For the full walkthrough, see{" "}
              <a href="/docs/connect-account">Connect an account</a>.
            </p>
            <h2>Managing your account</h2>
            <p>
              Settings is also where you manage preferences and your Bertram profile. If you ever want
              to step away, this is the place to disconnect your mailboxes — which severs Bertram's
              access without touching your underlying email.
            </p>
            <Callout label="Revoke anywhere">
              You can withdraw access from Bertram's Settings or directly from your Google or
              Microsoft account security page. Either one works.
            </Callout>
          </>
        ),
      },
      {
        slug: "keyboard-shortcuts",
        title: "Keyboard shortcuts",
        description: "Move through Bertram without touching the mouse.",
        body: (
          <>
            <p>
              Bertram is built to be driven from the keyboard. Once the common moves are in your
              fingers, triaging an inbox becomes far faster than clicking around. The single shortcut
              worth memorizing first is <code>?</code> — press it anywhere to bring up the full,
              always-current list.
            </p>
            <h2>A few to get you started</h2>
            <table>
              <thead>
                <tr>
                  <th>Shortcut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>?</code>
                  </td>
                  <td>Open the keyboard shortcuts overlay</td>
                </tr>
                <tr>
                  <td>
                    <code>⌘K</code>
                  </td>
                  <td>Search across your mail</td>
                </tr>
                <tr>
                  <td>
                    <code>c</code>
                  </td>
                  <td>Compose a new message</td>
                </tr>
                <tr>
                  <td>
                    <code>e</code>
                  </td>
                  <td>Archive the current thread</td>
                </tr>
                <tr>
                  <td>
                    <code>r</code>
                  </td>
                  <td>Reply to the current thread</td>
                </tr>
              </tbody>
            </table>
            <Callout label="The list is in the app">
              This is a representative sample, not the whole set. Press <code>?</code> in Bertram for
              the complete, up-to-date list of shortcuts.
            </Callout>
          </>
        ),
      },
      {
        slug: "billing",
        title: "Billing",
        description: "Where to find plan and payment details for your account.",
        body: (
          <>
            <p>
              Billing and plan details for your account are managed from your account area. If you are
              on a paid plan, this is where you would review your subscription and payment method.
            </p>
            <p>
              Plan availability and pricing can change over time, so the most accurate, current
              information always lives in the app and on the Bertram website rather than in these
              docs. We have kept this page deliberately light to avoid quoting numbers that might go
              stale.
            </p>
            <Callout label="Questions about a charge">
              If you have a question about billing, a charge you do not recognize, or changing your
              plan, <a href="/support">contact support</a> and we will help sort it out.
            </Callout>
          </>
        ),
      },
    ],
  },
  {
    label: "Support",
    items: [
      {
        slug: "get-help",
        title: "Getting help",
        description: "Where to go when something is wrong or missing.",
        body: (
          <>
            <p>
              If Bertram is not behaving the way you expect, or you want something it does not yet do,
              there is a clear path for each case. The docs cover how things are meant to work; these
              channels are for when you need a human or want to shape what comes next.
            </p>
            <h2>The right channel</h2>
            <ul>
              <li>
                <strong>General questions</strong> — <a href="/support">Support</a> is the front door
                for anything you are stuck on, including account and billing questions.
              </li>
              <li>
                <strong>Something is broken</strong> — file a{" "}
                <a href="/report-bug">bug report</a>. Tell us what you expected, what happened, and
                the steps to reproduce it. The more specific, the faster we can fix it.
              </li>
              <li>
                <strong>Something is missing</strong> — submit a{" "}
                <a href="/feature-request">feature request</a>. We genuinely read these, and they
                shape what we build.
              </li>
            </ul>
            <p>
              When reporting a problem, a few details go a long way: which account it happened on,
              roughly when, and what you were doing at the time. That context turns a vague report
              into something we can act on.
            </p>
            <Callout label="Privacy first">
              You never need to paste full email contents to get help. Describe the behavior — we can
              usually take it from there. For how your data is handled, see{" "}
              <a href="/docs/privacy">Privacy & data</a>.
            </Callout>
          </>
        ),
      },
    ],
  },
];

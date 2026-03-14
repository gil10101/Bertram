import Link from "next/link";
import { BertramLogo } from "@/components/common/bertram-logo";

export const metadata = {
  title: "Privacy Policy — Bertram",
  description: "Privacy policy for Bertram Mail, an AI-powered email manager.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-carbon-500 text-floral">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 md:px-12 md:py-6">
        <Link
          href="/"
          className="flex items-center gap-1 text-lg font-bold tracking-tight text-floral"
        >
          <BertramLogo size={34} />
          Bertram
        </Link>
        <Link
          href="/"
          className="text-[0.8rem] text-dust-400 transition-colors hover:text-floral"
        >
          &larr; Back
        </Link>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-2xl px-6 pb-24 pt-12 md:px-0">
        <h1 className="text-3xl font-light tracking-[-0.03em] md:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm text-dust-400">
          Last updated: March 12, 2026
        </p>

        <div className="mt-12 space-y-10 text-[0.95rem] leading-[1.8] text-dust-200">
          <section>
            <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.1em] text-paprika">
              Overview
            </h2>
            <p>
              Bertram (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;)
              is an AI-powered email management service. This policy describes
              how we collect, use, and protect your information when you use our
              application at bertrammail.com.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.1em] text-paprika">
              Information We Collect
            </h2>
            <p className="mb-3">
              When you connect your email account, we access:
            </p>
            <ul className="list-inside list-disc space-y-1.5 text-dust-300">
              <li>
                Email metadata (sender, recipient, subject, date) and message
                content for AI-powered features
              </li>
              <li>
                Calendar events when you enable meeting scheduling features
              </li>
              <li>
                Authentication tokens to maintain your email provider connection
              </li>
              <li>
                Account information provided through Clerk (name, email address)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.1em] text-paprika">
              How We Use Your Information
            </h2>
            <ul className="list-inside list-disc space-y-1.5 text-dust-300">
              <li>
                Summarize, prioritize, and classify your emails using AI
              </li>
              <li>Draft email replies and compose suggestions</li>
              <li>Schedule and manage meetings on your behalf</li>
              <li>
                Organize your inbox with labels and categories
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.1em] text-paprika">
              AI Processing
            </h2>
            <p>
              We use Anthropic&apos;s Claude API to process your email content
              for summarization, drafting, and classification. Email content sent
              to the AI is processed in real-time and is not stored by
              Anthropic beyond the duration of the API request, in accordance
              with Anthropic&apos;s data usage policies.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.1em] text-paprika">
              Data Storage &amp; Security
            </h2>
            <p>
              Your data is stored securely using Supabase with row-level
              security. OAuth tokens are encrypted at rest. We use Clerk for
              authentication, which provides enterprise-grade security including
              JWT verification and session management. We do not sell your data
              to third parties.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.1em] text-paprika">
              Third-Party Services
            </h2>
            <ul className="list-inside list-disc space-y-1.5 text-dust-300">
              <li>
                <strong className="text-floral">Google</strong> &mdash; Gmail
                and Google Calendar API access
              </li>
              <li>
                <strong className="text-floral">Microsoft</strong> &mdash;
                Outlook and Microsoft Calendar API access
              </li>
              <li>
                <strong className="text-floral">Anthropic</strong> &mdash;
                Claude AI for email intelligence
              </li>
              <li>
                <strong className="text-floral">Clerk</strong> &mdash;
                Authentication and user management
              </li>
              <li>
                <strong className="text-floral">Supabase</strong> &mdash;
                Database and storage
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.1em] text-paprika">
              Your Rights
            </h2>
            <p>You can at any time:</p>
            <ul className="mt-2 list-inside list-disc space-y-1.5 text-dust-300">
              <li>
                Disconnect your email account, which revokes our access
              </li>
              <li>Request deletion of all your data from our systems</li>
              <li>
                Export your data in a portable format
              </li>
              <li>
                Revoke Google or Microsoft permissions from your account
                settings
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.1em] text-paprika">
              Contact
            </h2>
            <p>
              For privacy-related questions or data requests, email us at{" "}
              <a
                href="mailto:privacy@bertrammail.com"
                className="text-paprika transition-colors hover:text-paprika-300"
              >
                privacy@bertrammail.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

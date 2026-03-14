import Link from "next/link";
import { BertramLogo } from "@/components/common/bertram-logo";

export const metadata = {
  title: "Terms of Service — Bertram",
  description: "Terms of service for Bertram Mail, an AI-powered email manager.",
};

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p className="mt-4 text-sm text-dust-400">
          Last updated: March 12, 2026
        </p>

        <div className="mt-12 space-y-10 text-[0.95rem] leading-[1.8] text-dust-200">
          <section>
            <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.1em] text-paprika">
              Acceptance of Terms
            </h2>
            <p>
              By accessing or using Bertram (&ldquo;the Service&rdquo;), you
              agree to be bound by these terms. If you do not agree, do not use
              the Service. We may update these terms from time to time &mdash;
              continued use constitutes acceptance of changes.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.1em] text-paprika">
              Description of Service
            </h2>
            <p>
              Bertram is an AI-powered email management tool that connects to
              your Gmail or Outlook account to help you read, organize,
              prioritize, and respond to emails. The Service also provides
              AI-assisted meeting scheduling and calendar management.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.1em] text-paprika">
              Account &amp; Access
            </h2>
            <ul className="list-inside list-disc space-y-1.5 text-dust-300">
              <li>
                You must authenticate via Clerk and connect at least one email
                provider to use the Service
              </li>
              <li>
                You are responsible for maintaining the security of your account
                credentials
              </li>
              <li>
                You must have the right to access the email accounts you connect
              </li>
              <li>
                We reserve the right to suspend accounts that violate these
                terms
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.1em] text-paprika">
              Email Access &amp; Permissions
            </h2>
            <p>
              By connecting your email account, you grant Bertram permission to
              read, send, modify labels, and manage emails on your behalf. You
              can revoke this access at any time by disconnecting your account in
              settings or revoking permissions directly from your Google or
              Microsoft account.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.1em] text-paprika">
              AI-Generated Content
            </h2>
            <p>
              The Service uses AI to draft replies, summarize emails, and
              classify messages. AI-generated content is provided as suggestions
              only. You are responsible for reviewing and approving all content
              before it is sent. Bertram is not liable for the accuracy,
              appropriateness, or consequences of AI-generated drafts that you
              choose to send.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.1em] text-paprika">
              Acceptable Use
            </h2>
            <p className="mb-2">You agree not to:</p>
            <ul className="list-inside list-disc space-y-1.5 text-dust-300">
              <li>Use the Service for spam, phishing, or bulk unsolicited email</li>
              <li>Attempt to reverse-engineer or extract AI model weights</li>
              <li>Circumvent rate limits or access controls</li>
              <li>Use the Service in violation of any applicable law</li>
              <li>Share your account access with unauthorized third parties</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.1em] text-paprika">
              Data &amp; Privacy
            </h2>
            <p>
              Your use of the Service is also governed by our{" "}
              <Link
                href="/privacy"
                className="text-paprika transition-colors hover:text-paprika-300"
              >
                Privacy Policy
              </Link>
              , which describes how we collect, use, and protect your data.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.1em] text-paprika">
              Service Availability
            </h2>
            <p>
              We aim to keep Bertram available at all times, but do not guarantee
              uninterrupted access. The Service depends on third-party APIs
              (Google, Microsoft, Anthropic) which may experience their own
              outages. We are not liable for downtime caused by external service
              disruptions.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.1em] text-paprika">
              Limitation of Liability
            </h2>
            <p>
              Bertram is provided &ldquo;as is&rdquo; without warranties of any
              kind. To the maximum extent permitted by law, we are not liable for
              any indirect, incidental, or consequential damages arising from
              your use of the Service, including but not limited to lost emails,
              missed meetings, or actions taken based on AI suggestions.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.1em] text-paprika">
              Termination
            </h2>
            <p>
              You may stop using Bertram at any time by disconnecting your
              accounts and deleting your data. We may terminate or suspend your
              access if you violate these terms, with notice where feasible.
              Upon termination, we will delete your data in accordance with our
              Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.1em] text-paprika">
              Contact
            </h2>
            <p>
              Questions about these terms? Email{" "}
              <a
                href="mailto:support@bertrammail.com"
                className="text-paprika transition-colors hover:text-paprika-300"
              >
                support@bertrammail.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

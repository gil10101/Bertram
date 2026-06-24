import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Nav } from "@/components/landing/nav";
import { DocsSidebar } from "@/components/docs/docs-sidebar";
import { DOC_GROUPS } from "@/components/docs/docs-content";
import "@/components/landing/landing.css";
import "@/components/docs/docs.css";

const FLAT = DOC_GROUPS.flatMap((g) => g.items);
const DEFAULT_SLUG = FLAT[0].slug;

export function generateStaticParams() {
  return [{ slug: [] as string[] }, ...FLAT.map((p) => ({ slug: [p.slug] }))];
}

export default async function DocsPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { userId } = await auth();
  const { slug } = await params;
  const current = slug?.[0] ?? DEFAULT_SLUG;

  const idx = FLAT.findIndex((p) => p.slug === current);
  if (idx === -1) notFound();

  const page = FLAT[idx];
  const prev = idx > 0 ? FLAT[idx - 1] : null;
  const next = idx < FLAT.length - 1 ? FLAT[idx + 1] : null;

  return (
    <div className="bertram-landing docs-shell">
      <Nav isSignedIn={!!userId} showLinks={false} homeHref="/" />

      <div className="docs-layout">
        <DocsSidebar />

        <main className="docs-content">
          <article className="docs-content-inner">
            <div className="docs-eyebrow">Documentation</div>
            <h1 className="docs-title">{page.title}</h1>
            {page.description && <p className="docs-lede">{page.description}</p>}

            <div className="doc-prose">{page.body}</div>

            <nav className="docs-pager">
              {prev ? (
                <Link className="prev" href={`/docs/${prev.slug}`}>
                  <div className="docs-pager-dir">← Previous</div>
                  <div className="docs-pager-title">{prev.title}</div>
                </Link>
              ) : (
                <span style={{ flex: 1 }} />
              )}
              {next ? (
                <Link className="next" href={`/docs/${next.slug}`}>
                  <div className="docs-pager-dir">Next →</div>
                  <div className="docs-pager-title">{next.title}</div>
                </Link>
              ) : (
                <span style={{ flex: 1 }} />
              )}
            </nav>
          </article>
        </main>
      </div>
    </div>
  );
}

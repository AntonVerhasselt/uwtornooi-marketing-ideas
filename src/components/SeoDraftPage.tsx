import Link from "next/link";
import type { ReactNode } from "react";
import type { SeoPageMeta } from "@/lib/seo-pages";
import { seoPages } from "@/lib/seo-pages";
import type { ContentBlock, SeoPageContent } from "@/lib/seo-content";

type SeoDraftPageProps = {
  meta: SeoPageMeta;
  content: SeoPageContent;
};

function Block({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "p":
      return <p>{block.text}</p>;
    case "ul":
      return (
        <ul className="list-disc space-y-2 pl-5">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="list-decimal space-y-2 pl-5">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      );
    case "callout":
      return (
        <p className="rounded-[11px] bg-green-tint px-4 py-3 text-green-dark">
          {block.text}
        </p>
      );
    case "table":
      return (
        <div className="overflow-x-auto rounded-[11px] border border-border">
          <table className="w-full min-w-[28rem] text-left text-sm">
            <thead className="bg-green-tint/60 text-ink">
              <tr>
                {block.headers.map((header) => (
                  <th key={header} className="px-3 py-2.5 font-semibold">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row.join("-")} className="border-t border-border">
                  {row.map((cell, index) => (
                    <td
                      key={`${row[0]}-${index}`}
                      className="px-3 py-2.5 text-ink-muted"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default:
      return null;
  }
}

function ClusterNav({ currentSlug }: { currentSlug: string }) {
  return (
    <nav
      aria-label="SEO content pages"
      className="rounded-[11px] border border-border bg-bg-elevated p-4 shadow-[var(--shadow-soft)]"
    >
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.12em] text-ink-faint">
        Cluster pages
      </p>
      <ul className="grid gap-1.5 sm:grid-cols-2">
        {seoPages.map((page) => {
          const active = page.slug === currentSlug;
          return (
            <li key={page.slug}>
              <Link
                href={page.href}
                className={`block rounded-[11px] px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-green-tint font-medium text-green-dark"
                    : "text-ink-muted hover:bg-green-tint/50 hover:text-ink"
                }`}
              >
                <span className="text-[11px] text-ink-faint">
                  {page.priority} · {page.clusterLabel}
                </span>
                <span className="block">{page.shortTitle}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function SeoDraftPage({ meta, content }: SeoDraftPageProps) {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
      <div className="ut-animate-fade-up mb-8">
        <div className="mb-6 flex flex-wrap items-center gap-3 text-sm">
          <Link
            href="/ideeen/seo-concurrent"
            className="text-ink-muted transition-colors hover:text-green-dark"
          >
            ← SEO strategy
          </Link>
          <span className="text-ink-faint">/</span>
          <span className="text-ink-faint">{meta.targetPath}</span>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <span className="rounded-[11px] bg-green-tint px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-green-dark">
            Draft for uwtornooi.be
          </span>
          <span className="rounded-[11px] border border-border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-ink-muted">
            {meta.priority} · {meta.clusterLabel}
          </span>
        </div>

        <h1 className="ut-display mb-4 text-4xl font-extrabold text-ink sm:text-5xl">
          {meta.h1}
        </h1>
        <p className="mb-2 text-sm text-ink-faint">
          Primary keyword:{" "}
          <span className="font-medium text-ink-muted">{meta.primaryKeyword}</span>
        </p>
        <p className="rounded-[11px] border border-dashed border-border bg-bg-elevated/80 px-4 py-3 text-sm text-ink-muted">
          <span className="font-medium text-ink">SEO title:</span> {meta.title}
          <br />
          <span className="font-medium text-ink">Meta:</span>{" "}
          {meta.metaDescription}
        </p>
      </div>

      <div className="ut-animate-fade-up ut-delay-1 mb-10">
        <ClusterNav currentSlug={meta.slug} />
      </div>

      <article className="ut-animate-fade-up ut-delay-2 space-y-8">
        <section className="space-y-3 text-[15px] leading-relaxed text-ink-muted">
          {content.intro.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </section>

        {content.sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="rounded-[11px] border border-border bg-bg-elevated p-6 shadow-[var(--shadow-soft)] sm:p-7"
          >
            <h2 className="ut-display mb-3 text-xl font-extrabold text-ink">
              {section.heading}
            </h2>
            <div className="space-y-3 text-[15px] leading-relaxed text-ink-muted">
              {section.blocks.map((block, index) => (
                <Block key={`${section.id}-${index}`} block={block} />
              ))}
            </div>
          </section>
        ))}

        <section className="rounded-[11px] border border-border bg-bg-elevated p-6 shadow-[var(--shadow-soft)] sm:p-7">
          <h2 className="ut-display mb-3 text-xl font-extrabold text-ink">
            Veelgestelde vragen
          </h2>
          <div className="space-y-4">
            {content.faqs.map((faq) => (
              <div key={faq.question}>
                <h3 className="mb-1 text-[15px] font-semibold text-ink">
                  {faq.question}
                </h3>
                <p className="text-[15px] leading-relaxed text-ink-muted">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[11px] bg-green-dark px-6 py-7 text-white sm:px-8">
          <h2 className="ut-display mb-2 text-2xl font-extrabold">
            {content.cta.heading}
          </h2>
          <p className="mb-5 max-w-xl text-[15px] leading-relaxed text-white/85">
            {content.cta.text}
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={content.cta.primaryHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-[11px] bg-white px-4 py-2.5 text-sm font-semibold text-green-dark transition-transform hover:scale-[1.02]"
            >
              {content.cta.primaryLabel}
            </a>
            {content.cta.secondaryLabel && content.cta.secondaryHref ? (
              <Link
                href={content.cta.secondaryHref}
                className="rounded-[11px] border border-white/35 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                {content.cta.secondaryLabel}
              </Link>
            ) : null}
          </div>
        </section>

        <section>
          <h2 className="ut-display mb-3 text-lg font-extrabold text-ink">
            Verder lezen in dit cluster
          </h2>
          <ul className="flex flex-wrap gap-2">
            {content.internalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex rounded-[11px] border border-border bg-bg-elevated px-3 py-2 text-sm text-ink-muted transition-colors hover:border-green-light hover:text-green-dark"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href="https://uwtornooi.be"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-[11px] border border-border bg-bg-elevated px-3 py-2 text-sm text-ink-muted transition-colors hover:border-green-light hover:text-green-dark"
              >
                Homepage uwtornooi.be ↗
              </a>
            </li>
          </ul>
        </section>
      </article>
    </main>
  );
}

export function SeoSection({
  title,
  children,
  id,
}: {
  title: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section
      id={id}
      className="rounded-[11px] border border-border bg-bg-elevated p-6 shadow-[var(--shadow-soft)] sm:p-7"
    >
      <h2 className="ut-display mb-3 text-xl font-extrabold text-ink">{title}</h2>
      <div className="space-y-3 text-[15px] leading-relaxed text-ink-muted">
        {children}
      </div>
    </section>
  );
}

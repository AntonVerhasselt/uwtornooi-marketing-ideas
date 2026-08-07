import type { Metadata } from "next";
import Link from "next/link";
import { IdeaPageShell, Section } from "@/components/IdeaPageShell";
import { getIdea } from "@/lib/ideas";
import { notFound } from "next/navigation";

const idea = getIdea("club-data");

export const metadata: Metadata = {
  title: idea?.title ?? "Club data",
  description: idea?.summary,
};

export default function ClubDataPage() {
  if (!idea) notFound();

  return (
    <IdeaPageShell idea={idea}>
      <section className="rounded-[11px] border border-green-dark/20 bg-green-tint/70 p-6 shadow-[var(--shadow-soft)] sm:p-7">
        <h2 className="ut-display mb-2 text-xl font-extrabold text-ink">
          View the data
        </h2>
        <p className="mb-5 text-[15px] leading-relaxed text-ink-muted">
          The lead CRM lives at{" "}
          <code className="rounded bg-bg-elevated px-1.5 py-0.5 text-xs text-ink">
            /intel
          </code>
          : upcoming tournament leads, club contacts, Facebook / Instagram /
          website links, and the source post or blog for each signal.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/intel"
            className="rounded-[11px] bg-green-dark px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
          >
            Open lead CRM
          </Link>
          <Link
            href="/intel/clubs?upcoming=1"
            className="rounded-[11px] border border-border bg-bg-elevated px-4 py-2.5 text-sm font-medium text-ink hover:bg-bg"
          >
            Clubs with upcoming tournaments
          </Link>
          <Link
            href="/intel/clubs"
            className="rounded-[11px] border border-border bg-bg-elevated px-4 py-2.5 text-sm font-medium text-ink hover:bg-bg"
          >
            All clubs
          </Link>
        </div>
      </section>

      <Section title="Status">
        <p>
          MVP is live. Pipeline: RBFA import → website crawl →
          Facebook/Instagram/blog scrape → GPT-5.6 Luna classification → SQLite
          tournament DB + CRM UI.
        </p>
      </Section>

      <Section title="Pipeline">
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            Import Antwerp provincial clubs from Voetbal Vlaanderen GraphQL
            (`getTeamsInSeries` + `getClubInfo`).
          </li>
          <li>
            Crawl each club website for Facebook, Instagram, and tournament
            pages.
          </li>
          <li>
            Scrape ~16 months of Facebook / Instagram / blog content with a
            custom Playwright + Cheerio scraper.
          </li>
          <li>
            Analyze posts in batches with <strong>GPT-5.6 Luna</strong> (medium
            reasoning). Store only confirmed tournament posts.
          </li>
        </ol>
      </Section>

      <Section title="Commands">
        <ul className="list-disc space-y-2 pl-5 font-mono text-sm">
          <li>npm run intel:import</li>
          <li>npm run intel:contacts</li>
          <li>npm run intel:crawl</li>
          <li>npm run intel:scrape</li>
          <li>npm run intel:analyze</li>
          <li>npm run intel:pipeline</li>
        </ul>
      </Section>
    </IdeaPageShell>
  );
}

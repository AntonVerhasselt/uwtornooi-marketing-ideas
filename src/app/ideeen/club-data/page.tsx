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
      <Section title="Status">
        <p>
          MVP is implemented under{" "}
          <Link href="/intel" className="font-medium text-green-dark hover:underline">
            /intel
          </Link>
          . Pipeline: RBFA import → website crawl → Facebook/Instagram/blog scrape
          → GPT-5.6 Luna classification → SQLite tournament DB.
        </p>
      </Section>

      <Section title="Pipeline">
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            Import Antwerp provincial clubs from Voetbal Vlaanderen GraphQL
            (`getTeamsInSeries` + `getClubInfo`).
          </li>
          <li>Crawl each club website for Facebook, Instagram, and tournament pages.</li>
          <li>
            Scrape ~16 months of Facebook / Instagram / blog content with a custom
            Playwright + Cheerio scraper.
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
          <li>npm run intel:crawl</li>
          <li>npm run intel:scrape</li>
          <li>npm run intel:analyze</li>
          <li>npm run intel:pipeline</li>
        </ul>
      </Section>
    </IdeaPageShell>
  );
}

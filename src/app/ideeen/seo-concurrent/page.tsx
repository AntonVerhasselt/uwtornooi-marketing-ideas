import type { Metadata } from "next";
import { IdeaPageShell, Section } from "@/components/IdeaPageShell";
import { getIdea } from "@/lib/ideas";
import { notFound } from "next/navigation";

const idea = getIdea("seo-concurrent");

export const metadata: Metadata = {
  title: idea?.title ?? "SEO content",
  description: idea?.summary,
};

export default function SeoConcurrentPage() {
  if (!idea) notFound();

  return (
    <IdeaPageShell idea={idea}>
      <Section title="Intent">
        <p>
          Capture search demand around the main competitor with content that
          honestly compares options and steers organisers toward UwTornooi.be
          (free, fast setup, live standings).
        </p>
      </Section>

      <Section title="Content directions">
        <ul className="list-disc space-y-2 pl-5">
          <li>“[Competitor] alternative” / comparison pages</li>
          <li>Guides for running a club tournament online</li>
          <li>Feature-focused posts that map to competitor keywords</li>
          <li>Internal links into product CTAs on uwtornooi.be</li>
        </ul>
      </Section>

      <Section title="Open questions for the next agent">
        <ul className="list-disc space-y-2 pl-5">
          <li>Exact competitor name and priority keywords</li>
          <li>Where content lives (this site, blog, or uwtornooi.be)</li>
          <li>Language (NL) and local SEO for Belgium / Flanders</li>
          <li>Tone: helpful comparison, not smear</li>
        </ul>
        <p className="rounded-[11px] bg-green-tint px-4 py-3 text-green-dark">
          Ready for a dedicated SEO agent once competitor + keyword list is
          confirmed.
        </p>
      </Section>
    </IdeaPageShell>
  );
}

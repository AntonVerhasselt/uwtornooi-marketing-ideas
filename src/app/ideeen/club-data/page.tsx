import type { Metadata } from "next";
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
      <Section title="Intent">
        <p>
          Build a local pipeline that finds Flemish football clubs likely to
          organise tournaments, so outreach (idea 2) has real context instead of
          generic cold spam.
        </p>
      </Section>

      <Section title="Planned pipeline">
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            Scrape club data from{" "}
            <strong className="font-medium text-ink">Voetbal Vlaanderen</strong>{" "}
            and store it in a local SQLite database.
          </li>
          <li>
            For each club website, scrape the site to extract Facebook and
            Instagram links.
          </li>
          <li>
            Using website + Facebook page + Instagram account, scrape posts from
            the past ~16 months.
          </li>
          <li>
            Detect posts about tournaments the club organised (not just
            participated in).
          </li>
        </ol>
      </Section>

      <Section title="Outputs we want">
        <ul className="list-disc space-y-2 pl-5">
          <li>Club identity + contact surface (site, FB, IG)</li>
          <li>Evidence posts that mention a self-organised tournament</li>
          <li>Timestamps / season context for outreach timing</li>
        </ul>
      </Section>

      <Section title="Status for agents">
        <p>
          <strong className="font-medium text-ink">Do not start implementing</strong>{" "}
          this track yet. More product and scraping detail will follow. Keep
          this page as the brief holder until then.
        </p>
        <p className="rounded-[11px] bg-green-tint px-4 py-3 text-green-dark">
          Next: flesh out sources, fields, and detection rules — then hand to a
          dedicated agent.
        </p>
      </Section>
    </IdeaPageShell>
  );
}

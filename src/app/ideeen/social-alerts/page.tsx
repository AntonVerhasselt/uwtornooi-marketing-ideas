import type { Metadata } from "next";
import { IdeaPageShell, Section } from "@/components/IdeaPageShell";
import { getIdea } from "@/lib/ideas";
import { notFound } from "next/navigation";

const idea = getIdea("social-alerts");

export const metadata: Metadata = {
  title: idea?.title ?? "Social alerts",
  description: idea?.summary,
};

export default function SocialAlertsPage() {
  if (!idea) notFound();

  return (
    <IdeaPageShell idea={idea}>
      <Section title="Intent">
        <p>
          Once idea 1 has Facebook pages and Instagram accounts for Flemish
          clubs, run a daily job that watches for{" "}
          <strong className="font-medium text-ink">new posts</strong>. When a
          post looks like the club is announcing a tournament they organise,
          alert the team so we can reply in public (comment) and in private (DM)
          while the announcement is still fresh.
        </p>
        <p className="rounded-[11px] bg-green-tint px-4 py-3 text-green-dark">
          Reactive, timing-sensitive outreach — complementary to idea 2’s
          planned cold sequence from last year’s tournament data.
        </p>
      </Section>

      <Section title="Depends on">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="font-medium text-ink">Idea 1</strong> — club
            identity + Facebook URL + Instagram handle (and ideally a stable
            local store of those links).
          </li>
          <li>
            A way to fetch recent posts (Meta Graph API where available, or a
            controlled scrape fallback documented later).
          </li>
          <li>
            A notification channel for the team (e.g. email, Slack, or a simple
            inbox page on this board).
          </li>
        </ul>
      </Section>

      <Section title="How it would work">
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <strong className="font-medium text-ink">Nightly / daily cron</strong>
            {" — "}
            For every club with a known FB page and/or IG account, pull posts
            newer than the last successful check (cursor /{" "}
            <code className="rounded bg-green-tint px-1.5 py-0.5 text-[13px] text-green-dark">
              last_seen_at
            </code>
            ).
          </li>
          <li>
            <strong className="font-medium text-ink">Deduplicate</strong>
            {" — "}
            Skip posts already stored by post ID / permalink so we never alert
            twice on the same announcement.
          </li>
          <li>
            <strong className="font-medium text-ink">Classify</strong>
            {" — "}
            Run a lightweight classifier (rules + optional LLM) that answers:
            “Is this club announcing a tournament they organise?” Prefer
            self-organised signals over “we play at someone else’s tornooi”.
          </li>
          <li>
            <strong className="font-medium text-ink">Score & filter</strong>
            {" — "}
            Keep only high-confidence hits (or queue medium ones for human
            triage). Drop noise: match reports, sponsor thanks, player of the
            week, etc.
          </li>
          <li>
            <strong className="font-medium text-ink">Notify</strong>
            {" — "}
            Send the team a short alert with club name, platform, post snippet,
            permalink, detected date/season cues, and confidence.
          </li>
          <li>
            <strong className="font-medium text-ink">Human outreach</strong>
            {" — "}
            Someone on the team opens the post, leaves a helpful comment, and
            sends a DM pointing to{" "}
            <a
              href="https://uwtornooi.be"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-green-dark underline-offset-2 hover:underline"
            >
              uwtornooi.be
            </a>
            . Automation stops at the alert — commenting and DMing stay manual
            for tone and platform risk.
          </li>
        </ol>
      </Section>

      <Section title="Detection signals (draft)">
        <p>Positive cues that a post is a host announcement:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Dutch/Flemish phrases like “inschrijven”, “inschrijvingen open”,
            “tornooi”, “jeugdtornooi”, “save the date”, “save-the-date”,
            “komende zomer”, “poules”, “categorieën”, registration links or
            forms.
          </li>
          <li>
            Host framing: “ons tornooi”, “bij ons op het complex”, “wij
            organiseren”, flyer with the club’s own crest/name as organiser.
          </li>
          <li>
            Forward-looking dates (next season / next months), not only
            after-action photo dumps.
          </li>
        </ul>
        <p>Negative / exclude cues:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            “Deelnemers gezocht voor tornooi bij X” where X is another club.
          </li>
          <li>
            Recaps (“geslaagd tornooi”, “dank aan alle ploegen”) unless they
            also announce next year’s edition.
          </li>
          <li>League/competition matchday posts with no tournament framing.</li>
        </ul>
      </Section>

      <Section title="Alert payload (what we want in the notification)">
        <ul className="list-disc space-y-2 pl-5">
          <li>Club name + province / series if known from idea 1</li>
          <li>Platform (Facebook / Instagram) + permalink</li>
          <li>Post text snippet (and image OCR note if the flyer is the only signal)</li>
          <li>Posted at + first seen by the cron</li>
          <li>Classifier confidence + short reason (“inschrijvingen open + ons tornooi”)</li>
          <li>
            Suggested next actions: comment template link + DM template link
            (reuse angles from idea 2, shortened for a live post)
          </li>
        </ul>
      </Section>

      <Section title="Human playbook after an alert">
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            Open the permalink within a few hours if possible — early comments
            get more visibility under a popular club post.
          </li>
          <li>
            Comment as a helpful peer, not an ad: acknowledge the tournament,
            offer free software for inschrijvingen / poules / live standen,
            link to uwtornooi.be.
          </li>
          <li>
            Follow with a short DM to the page/account (or known organiser if
            idea 1 has a contact): same angle, more personal, ask if they
            already have tooling for this edition.
          </li>
          <li>
            Log outcome (commented / DMed / replied / not a host after all) so
            the cron queue stays clean and we can measure hit rate.
          </li>
        </ol>
      </Section>

      <Section title="Vs idea 2 (cold outreach)">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="font-medium text-ink">Idea 2</strong> starts from
            last year’s tournament month and runs a fixed 5-day sequence even if
            the club has not posted yet.
          </li>
          <li>
            <strong className="font-medium text-ink">Idea 4</strong> waits for a
            fresh announcement post, then strikes on that thread — higher
            relevance, narrower window, fewer false opens if the classifier is
            tight.
          </li>
          <li>
            Same club can appear in both tracks; suppress idea-2 Day 1 if we
            already engaged via an idea-4 alert that week.
          </li>
        </ul>
      </Section>

      <Section title="Risks & constraints (for later design)">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Platform ToS / rate limits — prefer official APIs; keep scrape
            volume low and polite if used as fallback.
          </li>
          <li>
            False positives waste trust — human confirm before commenting when
            confidence is medium.
          </li>
          <li>
            Do not auto-post comments or DMs in v1; automation = detect +
            notify only.
          </li>
          <li>
            Image-only flyers need OCR or multimodal classification or they will
            be missed.
          </li>
        </ul>
      </Section>

      <Section title="Status for agents">
        <p>
          <strong className="font-medium text-ink">Do not start implementing</strong>{" "}
          this track yet. This page is the product brief only. Idea 1 (club
          social links + storage) should exist before a cron is worth building.
        </p>
        <p className="rounded-[11px] bg-green-tint px-4 py-3 text-green-dark">
          Next when greenlit: define post store schema, classifier rubric, alert
          channel, and a dry-run week on a small club sample — then hand to a
          dedicated agent.
        </p>
      </Section>
    </IdeaPageShell>
  );
}

import type { Metadata } from "next";
import { IdeaPageShell, Section } from "@/components/IdeaPageShell";
import { getIdea } from "@/lib/ideas";
import { notFound } from "next/navigation";

const idea = getIdea("cold-outreach");

export const metadata: Metadata = {
  title: idea?.title ?? "Cold outreach",
  description: idea?.summary,
};

export default function ColdOutreachPage() {
  if (!idea) notFound();

  return (
    <IdeaPageShell idea={idea}>
      <Section title="Intent">
        <p>
          Turn tournament signals from club data into a repeatable social cold
          outreach motion — contextual messages on Facebook and Instagram that
          point organisers to free software on uwtornooi.be.
        </p>
      </Section>

      <Section title="Depends on">
        <p>
          Idea 1 (club data & tournament signals). Outreach quality hinges on
          knowing who ran a tournament recently and where they post.
        </p>
      </Section>

      <Section title="What goes here next">
        <ul className="list-disc space-y-2 pl-5">
          <li>Outreach sequence (steps, timing, channels)</li>
          <li>Message angles tied to a recent tournament post</li>
          <li>Rules for commenting vs DM vs follow-up</li>
          <li>Simple tracking of who was contacted and replies</li>
        </ul>
        <p className="rounded-[11px] bg-green-tint px-4 py-3 text-green-dark">
          Sequence will be proposed separately — this page is the home for that
          brief.
        </p>
      </Section>

      <Section title="Success look like">
        <p>
          Organisers reply because the message references their actual
          tournament, then try UwTornooi for the next edition.
        </p>
      </Section>
    </IdeaPageShell>
  );
}

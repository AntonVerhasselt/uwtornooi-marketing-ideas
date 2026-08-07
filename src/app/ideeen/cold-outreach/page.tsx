import type { Metadata } from "next";
import { IdeaPageShell, Section } from "@/components/IdeaPageShell";
import { getIdea } from "@/lib/ideas";
import {
  channelRules,
  loomDemoTip,
  messageAngles,
  onReplyRule,
  sequenceOverview,
  sequenceSteps,
  successMetrics,
  trackingFields,
} from "@/lib/outreach-sequence";
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
          Use historical tournament data from idea 1 to run a short, direct cold
          outreach sequence — Instagram DM, Facebook DM, email, then a call —
          pointing organisers to free software on{" "}
          <a
            href={sequenceOverview.ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-green-dark underline-offset-2 hover:underline"
          >
            uwtornooi.be
          </a>
          .
        </p>
        <p className="rounded-[11px] bg-green-tint px-4 py-3 text-green-dark">
          {sequenceOverview.principle}
        </p>
      </Section>

      <Section title="Depends on">
        <p>
          Idea 1 (club data & tournament signals): club identity, last
          tournament month/year, Instagram, Facebook, email, and phone. Outreach
          starts from that past signal — not from waiting for a new post.
        </p>
      </Section>

      <Section title="Sequence overview">
        <p>
          <strong className="font-medium text-ink">{sequenceOverview.name}</strong>
          {" — "}
          {sequenceOverview.windowDays}-day window on{" "}
          {sequenceOverview.channels.join(" → ")}. CTA:{" "}
          {sequenceOverview.ctaLabel}.
        </p>
        <p className="rounded-[11px] border border-border bg-bg px-4 py-3 text-ink">
          <strong className="font-medium">{onReplyRule.title}:</strong>{" "}
          {onReplyRule.summary}
        </p>
        <ol className="list-decimal space-y-4 pl-5">
          {sequenceSteps.map((step) => (
            <li key={step.id} className="space-y-2">
              <p className="font-medium text-ink">
                Day {step.day}: {step.title}
              </p>
              <p>
                <span className="text-ink-faint">Channel · </span>
                {step.channelLabel}
              </p>
              <p>
                <span className="text-ink-faint">Timing · </span>
                {step.timing}
              </p>
              <p>
                <span className="text-ink-faint">Goal · </span>
                {step.goal}
              </p>
              <p>
                <span className="text-ink-faint">Skip when · </span>
                {step.whenToSkip}
              </p>
              <pre className="overflow-x-auto whitespace-pre-wrap rounded-[11px] border border-border bg-bg px-4 py-3 font-sans text-sm text-ink">
                {step.templateNl}
              </pre>
              <ul className="list-disc space-y-1 pl-5">
                {step.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </Section>

      <Section title={onReplyRule.title}>
        <p>{onReplyRule.summary}</p>
        <p className="mb-1 text-sm font-medium uppercase tracking-wide text-ink-faint">
          Do
        </p>
        <ul className="mb-3 list-disc space-y-1 pl-5">
          {onReplyRule.do.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="mb-1 text-sm font-medium uppercase tracking-wide text-ink-faint">
          Don&apos;t
        </p>
        <ul className="list-disc space-y-1 pl-5">
          {onReplyRule.dont.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>

      <Section title={loomDemoTip.title}>
        <p>
          {loomDemoTip.summary} Record and share for free via{" "}
          <a
            href={loomDemoTip.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-green-dark underline-offset-2 hover:underline"
          >
            {loomDemoTip.urlLabel}
          </a>
          .
        </p>
        <ul className="list-disc space-y-2 pl-5">
          {loomDemoTip.tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </Section>

      <Section title="Message angles">
        <p>
          Angles are driven by last year’s tournament record — pick one, then
          fill the day 1–4 templates.
        </p>
        <ul className="space-y-4">
          {messageAngles.map((angle) => (
            <li
              key={angle.id}
              className="rounded-[11px] border border-border bg-bg px-4 py-3"
            >
              <p className="font-medium text-ink">{angle.title}</p>
              <p className="mt-1">
                <span className="text-ink-faint">Trigger · </span>
                {angle.trigger}
              </p>
              <p>
                <span className="text-ink-faint">Angle · </span>
                {angle.angle}
              </p>
              <p className="mt-2 text-green-dark">{angle.exampleHookNl}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Channel rules">
        <div className="space-y-5">
          {channelRules.map((rule) => (
            <div key={rule.id}>
              <p className="mb-2 font-medium text-ink">{rule.title}</p>
              <p className="mb-1 text-sm font-medium uppercase tracking-wide text-ink-faint">
                Do
              </p>
              <ul className="mb-3 list-disc space-y-1 pl-5">
                {rule.do.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="mb-1 text-sm font-medium uppercase tracking-wide text-ink-faint">
                Don&apos;t
              </p>
              <ul className="list-disc space-y-1 pl-5">
                {rule.dont.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Simple tracking">
        <p>
          Spreadsheet or SQLite table is enough for a pilot. Minimum columns:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          {trackingFields.map((field) => (
            <li key={field.field}>
              <strong className="font-medium text-ink">{field.field}</strong>
              {" — "}
              {field.purpose}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Success looks like">
        <p>
          Organisers engage because you name their past tournament and ask
          directly about this season — then try UwTornooi for the next edition.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          {successMetrics.map((metric) => (
            <li key={metric}>{metric}</li>
          ))}
        </ul>
      </Section>
    </IdeaPageShell>
  );
}

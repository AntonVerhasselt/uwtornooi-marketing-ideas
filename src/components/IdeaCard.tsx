import Link from "next/link";
import type { Idea } from "@/lib/ideas";

type IdeaCardProps = {
  idea: Idea;
};

export function IdeaCard({ idea }: IdeaCardProps) {
  return (
    <Link
      href={idea.href}
      className="group relative flex flex-col rounded-[11px] border border-border bg-bg-elevated p-6 shadow-[var(--shadow-soft)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-green-light hover:shadow-[0_12px_32px_color-mix(in_oklch,var(--green-dark)_12%,transparent)] sm:p-7"
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-green-tint text-sm font-bold text-green-dark">
          {idea.number}
        </span>
        <span className="rounded-[11px] bg-green-tint px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-green-dark">
          {idea.statusLabel}
        </span>
      </div>
      <h2 className="ut-display mb-2 text-2xl font-extrabold text-ink transition-colors group-hover:text-green-dark">
        {idea.title}
      </h2>
      <p className="mb-6 flex-1 text-[15px] leading-relaxed text-ink-muted">
        {idea.summary}
      </p>
      <div className="flex items-center justify-between border-t border-border pt-4 text-sm">
        <span className="text-ink-faint">{idea.outcome}</span>
        <span className="font-medium text-green-dark transition-transform duration-300 group-hover:translate-x-0.5">
          Open →
        </span>
      </div>
    </Link>
  );
}

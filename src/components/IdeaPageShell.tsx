import Link from "next/link";
import type { Idea } from "@/lib/ideas";
import type { ReactNode } from "react";

type IdeaPageShellProps = {
  idea: Idea;
  children: ReactNode;
};

export function IdeaPageShell({ idea, children }: IdeaPageShellProps) {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
      <div className="ut-animate-fade-up mb-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-green-dark"
        >
          ← Back to overview
        </Link>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-green-tint text-sm font-bold text-green-dark">
            {idea.number}
          </span>
          <span className="rounded-[11px] bg-green-tint px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-green-dark">
            {idea.statusLabel}
          </span>
        </div>
        <h1 className="ut-display mb-3 text-4xl font-extrabold text-ink sm:text-5xl">
          {idea.title}
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-ink-muted">
          {idea.summary}
        </p>
      </div>

      <div className="ut-animate-fade-up ut-delay-1 space-y-8">{children}</div>
    </main>
  );
}

export function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[11px] border border-border bg-bg-elevated p-6 shadow-[var(--shadow-soft)] sm:p-7">
      <h2 className="ut-display mb-3 text-xl font-extrabold text-ink">
        {title}
      </h2>
      <div className="space-y-3 text-[15px] leading-relaxed text-ink-muted">
        {children}
      </div>
    </section>
  );
}

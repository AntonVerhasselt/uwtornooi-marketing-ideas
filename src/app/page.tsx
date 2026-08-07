import Link from "next/link";
import { IdeaCard } from "@/components/IdeaCard";
import { ideas } from "@/lib/ideas";
import { seoPages } from "@/lib/seo-pages";

const seoIdea = ideas.find((idea) => idea.slug === "seo-concurrent");
const highlightPages = seoPages.filter((page) => page.priority === "P0");

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 py-14 sm:px-8 sm:py-20">
      <section className="mb-12 max-w-2xl sm:mb-16">
        <p className="ut-animate-fade-up mb-4 text-sm font-medium uppercase tracking-[0.14em] text-green-dark">
          Marketing & sales
        </p>
        <h1 className="ut-display ut-animate-fade-up ut-delay-1 mb-5 text-5xl font-extrabold text-ink sm:text-6xl">
          UwTornooi
          <span className="block text-green-dark">ideas board</span>
        </h1>
        <p className="ut-animate-fade-up ut-delay-2 max-w-xl text-lg leading-relaxed text-ink-muted">
          Overview of growth ideas for{" "}
          <a
            href="https://uwtornooi.be"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-green-dark underline-offset-2 hover:underline"
          >
            uwtornooi.be
          </a>
          . Start with the Tournify SEO/SEA cluster — strategy and Dutch drafts
          are ready to explore.
        </p>
      </section>

      <section
        aria-label="Growth ideas"
        className="ut-animate-fade-up ut-delay-3 grid gap-5 sm:grid-cols-2"
      >
        {ideas.map((idea) => (
          <IdeaCard key={idea.slug} idea={idea} />
        ))}
      </section>

      {seoIdea ? (
        <section className="ut-animate-fade-up ut-delay-4 mt-14">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="mb-1 text-sm font-medium uppercase tracking-[0.12em] text-green-dark">
                Featured track
              </p>
              <h2 className="ut-display text-3xl font-extrabold text-ink">
                SEO + SEA vs Tournify
              </h2>
              <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
                Competitor awareness → trust → free migration → signup. Open the
                strategy hub, then browse the P0 drafts below.
              </p>
            </div>
            <Link
              href={seoIdea.href}
              className="rounded-[11px] bg-green-dark px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
            >
              Open full strategy →
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {highlightPages.map((page) => (
              <Link
                key={page.slug}
                href={page.href}
                className="rounded-[11px] border border-border bg-bg-elevated p-4 shadow-[var(--shadow-soft)] transition-[transform,border-color] hover:-translate-y-0.5 hover:border-green-light"
              >
                <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-ink-faint">
                  {page.targetPath}
                </p>
                <p className="ut-display text-lg font-extrabold text-ink">
                  {page.shortTitle}
                </p>
                <p className="mt-1 text-sm text-ink-muted">
                  {page.primaryKeyword}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="ut-animate-fade-up ut-delay-4 mt-14 rounded-[11px] border border-border bg-green-tint/70 px-6 py-5 sm:px-7">
        <p className="ut-display mb-1 text-lg font-extrabold text-ink">
          How to use this site
        </p>
        <p className="text-[15px] leading-relaxed text-ink-muted">
          Homepage is the map. Idea 3 holds the Tournify strategy plus draft
          pages ready to ship to uwtornooi.be. Idea 2 has the planned cold
          sequence; idea 4 is the reactive social-alert brief. Club data (idea
          1) remains the lead-pipeline dependency for both outreach tracks.
        </p>
      </section>
    </main>
  );
}

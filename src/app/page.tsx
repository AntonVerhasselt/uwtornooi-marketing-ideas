import { IdeaCard } from "@/components/IdeaCard";
import { ideas } from "@/lib/ideas";

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
          . Club data has a live MVP in{" "}
          <a href="/intel" className="font-medium text-green-dark underline-offset-2 hover:underline">
            /intel
          </a>
          ; the other tracks are still briefs.
        </p>
      </section>

      <section
        aria-label="Growth ideas"
        className="ut-animate-fade-up ut-delay-3 grid gap-5 md:grid-cols-3"
      >
        {ideas.map((idea) => (
          <IdeaCard key={idea.slug} idea={idea} />
        ))}
      </section>

      <section className="ut-animate-fade-up ut-delay-4 mt-14 rounded-[11px] border border-border bg-green-tint/70 px-6 py-5 sm:px-7">
        <p className="ut-display mb-1 text-lg font-extrabold text-ink">
          How to use this site
        </p>
        <p className="text-[15px] leading-relaxed text-ink-muted">
          Homepage is the map. Club data opens the tournament intel dashboard.
          Use the other idea pages as briefs for the next agent.
        </p>
      </section>
    </main>
  );
}

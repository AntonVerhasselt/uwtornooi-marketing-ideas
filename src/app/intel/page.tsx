import Link from "next/link";
import { getDashboardStats, getUpcomingTournaments, listClubs } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tournament intel",
  description: "Amateur club tournament intelligence dashboard",
};

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-[11px] border border-border bg-bg-elevated/80 px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-ink-faint">
        {label}
      </p>
      <p className="ut-display mt-2 text-3xl font-extrabold text-ink">{value}</p>
    </div>
  );
}

export default async function IntelDashboardPage() {
  const [stats, upcoming, topClubs] = await Promise.all([
    getDashboardStats(),
    getUpcomingTournaments(8),
    listClubs(),
  ]);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8 sm:py-14">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.14em] text-green-dark">
            Internal tool
          </p>
          <h1 className="ut-display text-4xl font-extrabold text-ink sm:text-5xl">
            Tournament intel
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
            Clubs imported from Voetbal Vlaanderen, websites crawled for social
            links, posts analyzed with GPT-5.6 Luna for self-organised
            tournaments.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/intel/clubs"
            className="rounded-[11px] bg-green-dark px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
          >
            Clubs overview
          </Link>
          <Link
            href="/intel/import"
            className="rounded-[11px] border border-border bg-bg-elevated px-4 py-2.5 text-sm font-medium text-ink hover:bg-green-tint"
          >
            Import clubs
          </Link>
        </div>
      </div>

      <section className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Total clubs" value={stats.totalClubs} />
        <Stat label="Websites crawled" value={stats.websitesCrawled} />
        <Stat label="Facebook pages found" value={stats.facebookPagesFound} />
        <Stat label="Instagram found" value={stats.instagramFound} />
        <Stat label="Tournament posts" value={stats.tournamentPosts} />
        <Stat label="Upcoming tournaments" value={stats.upcomingTournaments} />
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="ut-display mb-4 text-2xl font-extrabold text-ink">
            Upcoming tournaments
          </h2>
          {upcoming.length === 0 ? (
            <p className="text-sm text-ink-muted">
              No upcoming tournament dates stored yet. Run the scrape + analyze
              pipeline.
            </p>
          ) : (
            <ul className="space-y-3">
              {upcoming.map((t) => (
                <li
                  key={t.id}
                  className="rounded-[11px] border border-border bg-bg-elevated/70 px-4 py-3"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <Link
                      href={`/intel/clubs/${t.club_id}`}
                      className="font-medium text-green-dark hover:underline"
                    >
                      {t.club_name}
                    </Link>
                    <span className="text-xs text-ink-faint">{t.event_date}</span>
                  </div>
                  <p className="mt-1 text-sm text-ink">
                    {t.tournament_name || "Tournament"}
                    {t.age_group ? ` · ${t.age_group}` : ""}
                  </p>
                  {t.summary ? (
                    <p className="mt-1 text-sm text-ink-muted">{t.summary}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="ut-display mb-4 text-2xl font-extrabold text-ink">
            Clubs with signals
          </h2>
          <ul className="space-y-2">
            {topClubs
              .filter((c) => c.tournament_count > 0)
              .slice(0, 10)
              .map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/intel/clubs/${c.id}`}
                    className="flex items-center justify-between rounded-[11px] border border-border bg-bg-elevated/70 px-4 py-3 hover:bg-green-tint/60"
                  >
                    <span className="font-medium text-ink">{c.name}</span>
                    <span className="text-sm text-ink-muted">
                      {c.tournament_count} tournament
                      {c.tournament_count === 1 ? "" : "s"}
                    </span>
                  </Link>
                </li>
              ))}
            {topClubs.every((c) => c.tournament_count === 0) ? (
              <p className="text-sm text-ink-muted">
                No tournament hits yet. Pipeline stats:{" "}
                {stats.analyzedCandidates}/{stats.candidatePosts} candidates
                analyzed.
              </p>
            ) : null}
          </ul>
        </section>
      </div>
    </main>
  );
}

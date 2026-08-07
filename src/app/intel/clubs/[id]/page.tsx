import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getClub,
  getClubPosts,
  getClubTournaments,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

function pct(confidence: number | null): string {
  if (confidence == null) return "—";
  return `${Math.round(confidence * 100)}%`;
}

function yearOf(date: string | null): string {
  if (!date) return "Unknown year";
  return date.slice(0, 4);
}

export default async function ClubDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isFinite(id)) notFound();

  const club = await getClub(id);
  if (!club) notFound();

  const [tournaments, posts] = await Promise.all([
    getClubTournaments(id),
    getClubPosts(id),
  ]);

  const byYear = new Map<string, typeof tournaments>();
  for (const t of tournaments) {
    const y = yearOf(t.event_date);
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y)!.push(t);
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-10 sm:px-8 sm:py-14">
      <p className="mb-2 text-sm text-ink-muted">
        <Link href="/intel" className="text-green-dark hover:underline">
          Tournament intel
        </Link>{" "}
        /{" "}
        <Link href="/intel/clubs" className="text-green-dark hover:underline">
          Clubs
        </Link>{" "}
        / {club.name}
      </p>

      <h1 className="ut-display mb-6 text-4xl font-extrabold text-ink">
        {club.name}
      </h1>

      <section className="mb-10 rounded-[11px] border border-border bg-bg-elevated/70 px-5 py-4">
        <h2 className="ut-display mb-3 text-xl font-extrabold text-ink">
          Club information
        </h2>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-ink-faint">Website</dt>
            <dd>
              {club.website_url ? (
                <a
                  href={club.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-dark hover:underline"
                >
                  {club.website_url}
                </a>
              ) : (
                "—"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-ink-faint">Facebook</dt>
            <dd>
              {club.facebook_url ? (
                <a
                  href={club.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-dark hover:underline"
                >
                  {club.facebook_url}
                </a>
              ) : (
                "—"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-ink-faint">Instagram</dt>
            <dd>
              {club.instagram_url ? (
                <a
                  href={club.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-dark hover:underline"
                >
                  {club.instagram_url}
                </a>
              ) : (
                "—"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-ink-faint">Series</dt>
            <dd className="text-ink-muted">{club.series_names || "—"}</dd>
          </div>
          <div>
            <dt className="text-ink-faint">Locality</dt>
            <dd className="text-ink-muted">{club.locality || "—"}</dd>
          </div>
        </dl>
      </section>

      <section className="mb-10">
        <h2 className="ut-display mb-2 text-2xl font-extrabold text-ink">
          Tournament history
        </h2>
        <p className="mb-4 text-sm text-ink-muted">
          {tournaments.length} tournament signal
          {tournaments.length === 1 ? "" : "s"}
          {tournaments.length
            ? ` · ${new Set(tournaments.map((t) => (t.tournament_name || "").toLowerCase()).filter(Boolean)).size} distinct names`
            : ""}
          . Clubs that host several events (e.g. U8 + U13 cups) get one row per
          tournament.
        </p>
        {tournaments.length === 0 ? (
          <p className="text-sm text-ink-muted">No tournament posts stored yet.</p>
        ) : (
          <div className="space-y-6">
            {[...byYear.entries()].map(([year, items]) => (
              <div key={year}>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-green-dark">
                  {year}
                </h3>
                <ul className="space-y-3">
                  {items.map((t) => (
                    <li
                      key={t.id}
                      className="rounded-[11px] border border-border bg-bg-elevated/70 px-4 py-3"
                    >
                      <p className="font-medium text-ink">
                        {t.tournament_name || "Tournament"}
                        {t.age_group ? ` · ${t.age_group}` : ""}
                      </p>
                      <dl className="mt-2 grid gap-1 text-sm text-ink-muted sm:grid-cols-2">
                        <div>
                          Tournament date: {t.event_date || "—"}
                        </div>
                        <div>
                          Registration: {t.registration_date || "—"}
                        </div>
                        <div>Category: {t.category || "—"}</div>
                        <div>Confidence: {pct(t.confidence)}</div>
                      </dl>
                      {t.summary ? (
                        <p className="mt-2 text-sm text-ink-muted">{t.summary}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="ut-display mb-4 text-2xl font-extrabold text-ink">
          Tournament posts
        </h2>
        {posts.length === 0 ? (
          <p className="text-sm text-ink-muted">
            Only AI-confirmed tournament posts are stored here.
          </p>
        ) : (
          <ul className="space-y-3">
            {posts.map((p) => (
              <li
                key={p.id}
                className="rounded-[11px] border border-border bg-bg-elevated/70 px-4 py-3"
              >
                <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-sm text-ink-faint">
                    {p.post_date || "Unknown date"}
                  </span>
                  <span className="text-sm text-ink-muted">
                    {p.tournament_name || "Tournament"} · {pct(p.confidence)}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
                  {p.post_text.length > 500
                    ? `${p.post_text.slice(0, 500)}…`
                    : p.post_text}
                </p>
                {p.facebook_post_url ? (
                  <a
                    href={p.facebook_post_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-sm text-green-dark hover:underline"
                  >
                    View original post
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

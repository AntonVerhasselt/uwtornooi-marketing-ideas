import Link from "next/link";
import { notFound } from "next/navigation";
import { ContactList } from "@/components/intel/ContactList";
import { CrmStatusForm } from "@/components/intel/CrmStatusForm";
import { EvidenceLink } from "@/components/intel/EvidenceLink";
import { IntelNav } from "@/components/intel/IntelNav";
import { StatusBadge } from "@/components/intel/StatusBadge";
import {
  getClub,
  getClubContacts,
  getClubPosts,
  getClubTournamentsWithEvidence,
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

function Channel({
  label,
  href,
}: {
  label: string;
  href: string | null;
}) {
  return (
    <div>
      <dt className="text-ink-faint">{label}</dt>
      <dd>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-green-dark hover:underline"
          >
            {href}
          </a>
        ) : (
          "—"
        )}
      </dd>
    </div>
  );
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

  const [tournaments, posts, contacts] = await Promise.all([
    getClubTournamentsWithEvidence(id),
    getClubPosts(id),
    getClubContacts(id),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = tournaments.filter(
    (t) => t.event_date && t.event_date >= today,
  );
  const past = tournaments.filter(
    (t) => !t.event_date || t.event_date < today,
  );

  const byYear = new Map<string, typeof past>();
  for (const t of past) {
    const y = yearOf(t.event_date);
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y)!.push(t);
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-10 sm:px-8 sm:py-14">
      <IntelNav current="/intel/clubs" />

      <p className="mb-2 text-sm text-ink-muted">
        <Link href="/intel" className="text-green-dark hover:underline">
          Pipeline
        </Link>{" "}
        /{" "}
        <Link href="/intel/clubs" className="text-green-dark hover:underline">
          Clubs
        </Link>{" "}
        / {club.name}
      </p>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="ut-display text-4xl font-extrabold text-ink">
          {club.name}
        </h1>
        <StatusBadge status={club.crm_status} />
      </div>
      {club.locality ? (
        <p className="mb-8 text-sm text-ink-muted">{club.locality}</p>
      ) : (
        <div className="mb-8" />
      )}

      <section className="mb-8 rounded-[11px] border border-border bg-bg-elevated/70 px-5 py-4">
        <h2 className="ut-display mb-3 text-xl font-extrabold text-ink">
          CRM
        </h2>
        <CrmStatusForm
          clubId={club.id}
          status={club.crm_status || "new"}
          notes={club.crm_notes}
          lastContactedAt={club.last_contacted_at}
        />
      </section>

      <section className="mb-8 rounded-[11px] border border-border bg-bg-elevated/70 px-5 py-4">
        <h2 className="ut-display mb-3 text-xl font-extrabold text-ink">
          Channels
        </h2>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <Channel label="Website" href={club.website_url} />
          <Channel label="Facebook" href={club.facebook_url} />
          <Channel label="Instagram" href={club.instagram_url} />
          <div>
            <dt className="text-ink-faint">Series</dt>
            <dd className="text-ink-muted">{club.series_names || "—"}</dd>
          </div>
        </dl>
      </section>

      <section className="mb-8">
        <h2 className="ut-display mb-2 text-2xl font-extrabold text-ink">
          Contacts
        </h2>
        <p className="mb-3 text-sm text-ink-muted">
          From Voetbal Vlaanderen / RBFA club info
          {contacts.length
            ? ` · ${contacts.filter((c) => c.email || c.phone).length} with email or phone`
            : ""}
        </p>
        <ContactList contacts={contacts} />
      </section>

      <section className="mb-10">
        <h2 className="ut-display mb-2 text-2xl font-extrabold text-ink">
          Upcoming tournaments
        </h2>
        <p className="mb-4 text-sm text-ink-muted">
          {upcoming.length} upcoming · each row links to the post or blog where
          it was found
        </p>
        {upcoming.length === 0 ? (
          <p className="text-sm text-ink-muted">No upcoming tournament dates.</p>
        ) : (
          <ul className="space-y-3">
            {upcoming.map((t) => (
              <li
                key={t.id}
                className="rounded-[11px] border border-border bg-bg-elevated/70 px-4 py-3"
              >
                <p className="font-medium text-ink">
                  {t.tournament_name || "Tournament"}
                  {t.age_group ? ` · ${t.age_group}` : ""}
                </p>
                <dl className="mt-2 grid gap-1 text-sm text-ink-muted sm:grid-cols-2">
                  <div>Date: {t.event_date || "—"}</div>
                  <div>Registration: {t.registration_date || "—"}</div>
                  <div>Category: {t.category || "—"}</div>
                  <div>Confidence: {pct(t.confidence)}</div>
                </dl>
                {t.summary ? (
                  <p className="mt-2 text-sm text-ink-muted">{t.summary}</p>
                ) : null}
                <div className="mt-3">
                  <EvidenceLink
                    source={t.evidence_source}
                    url={t.evidence_url}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-10">
        <h2 className="ut-display mb-2 text-2xl font-extrabold text-ink">
          Tournament history
        </h2>
        <p className="mb-4 text-sm text-ink-muted">
          {past.length} past / undated signal
          {past.length === 1 ? "" : "s"}
        </p>
        {past.length === 0 ? (
          <p className="text-sm text-ink-muted">No older tournament signals.</p>
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
                        <div>Date: {t.event_date || "—"}</div>
                        <div>Confidence: {pct(t.confidence)}</div>
                      </dl>
                      {t.summary ? (
                        <p className="mt-2 text-sm text-ink-muted">{t.summary}</p>
                      ) : null}
                      <div className="mt-3">
                        <EvidenceLink
                          source={t.evidence_source}
                          url={t.evidence_url}
                        />
                      </div>
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
          Source posts
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
                <div className="mt-2">
                  <EvidenceLink
                    source={p.evidence_source}
                    url={p.evidence_url || p.facebook_post_url}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

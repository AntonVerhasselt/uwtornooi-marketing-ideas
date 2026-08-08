import Link from "next/link";
import { ContactList } from "@/components/intel/ContactList";
import { EvidenceLink } from "@/components/intel/EvidenceLink";
import { IntelNav } from "@/components/intel/IntelNav";
import { StatusBadge } from "@/components/intel/StatusBadge";
import { CRM_STATUSES } from "@/lib/crm";
import type { CrmStatus } from "@/lib/db";
import {
  getContactsForClubs,
  getDashboardStats,
  getPipelineEventLeads,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tournament lead CRM",
  description: "Upcoming club tournaments with contacts and source evidence",
};

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-[11px] border border-border bg-bg-elevated/80 px-4 py-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-faint">
        {label}
      </p>
      <p className="ut-display mt-1 text-2xl font-extrabold text-ink">{value}</p>
    </div>
  );
}

function ChannelLinks({
  website,
  facebook,
  instagram,
}: {
  website: string | null;
  facebook: string | null;
  instagram: string | null;
}) {
  const links = [
    { href: website, label: "Website" },
    { href: facebook, label: "Facebook" },
    { href: instagram, label: "Instagram" },
  ].filter((l) => l.href);
  if (links.length === 0) {
    return <span className="text-sm text-ink-faint">No channels found</span>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href!}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-[8px] border border-border bg-bg px-2.5 py-1 text-xs font-medium text-green-dark hover:bg-green-tint"
        >
          {l.label}
        </a>
      ))}
    </div>
  );
}

function formatEventDates(
  start: string | null,
  end: string | null,
): string {
  if (!start) return "—";
  if (end && end !== start) return `${start} – ${end}`;
  return start;
}

function uniqueSources(
  sources: Array<{ source: string | null; evidence_url: string | null }>,
) {
  const seen = new Set<string>();
  const out: typeof sources = [];
  for (const s of sources) {
    const key = `${s.source || ""}|${s.evidence_url || ""}`;
    if (!s.evidence_url || seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
}

export default async function IntelPipelinePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const statusFilter =
    sp.status && CRM_STATUSES.some((s) => s.value === sp.status)
      ? (sp.status as CrmStatus)
      : "all";

  const [stats, leads] = await Promise.all([
    getDashboardStats(),
    getPipelineEventLeads({
      status: statusFilter === "all" ? "all" : statusFilter,
      limit: 80,
    }),
  ]);

  const clubIds = [...new Set(leads.map((l) => l.club_id))];
  const contactsByClub = await getContactsForClubs(clubIds);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8 sm:py-14">
      <IntelNav current="/intel" />

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.14em] text-green-dark">
            Lightweight CRM
          </p>
          <h1 className="ut-display text-4xl font-extrabold text-ink sm:text-5xl">
            Upcoming tournament leads
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
            Clubs with detected self-organised tournaments — channels, RBFA
            contacts, and the Facebook / Instagram / blog pages that evidence
            each clustered event.
          </p>
        </div>
        <Link
          href="/intel/clubs?upcoming=1"
          className="rounded-[11px] border border-border bg-bg-elevated px-4 py-2.5 text-sm font-medium text-ink hover:bg-green-tint"
        >
          Clubs with upcoming →
        </Link>
      </div>

      <section className="mb-8 grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Stat label="Upcoming tournaments" value={stats.upcomingTournaments} />
        <Stat label="Clubs in pipeline" value={stats.upcomingClubs} />
        <Stat label="Contacts loaded" value={stats.contactsLoaded} />
        <Stat label="Clubs in DB" value={stats.totalClubs} />
      </section>

      <form className="mb-6 flex flex-wrap items-center gap-2" method="get">
        <label className="text-sm text-ink-muted" htmlFor="status">
          CRM status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={statusFilter}
          className="rounded-[11px] border border-border bg-bg-elevated px-3 py-2 text-sm outline-none ring-green-dark/30 focus:ring-2"
        >
          <option value="all">All</option>
          {CRM_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-[11px] border border-border bg-bg-elevated px-3 py-2 text-sm font-medium hover:bg-green-tint"
        >
          Filter
        </button>
      </form>

      {leads.length === 0 ? (
        <p className="rounded-[11px] border border-border bg-bg-elevated/70 px-5 py-8 text-sm text-ink-muted">
          No upcoming tournament leads match this filter. Run scrape + analyze,
          or clear the status filter.
        </p>
      ) : (
        <ul className="space-y-4">
          {leads.map((lead) => {
            const contacts = contactsByClub.get(lead.club_id) || [];
            const sources = uniqueSources(lead.sources);
            return (
              <li
                key={lead.id}
                className="rounded-[14px] border border-border bg-bg-elevated/75 px-5 py-4 shadow-[var(--shadow-soft)]"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/intel/clubs/${lead.club_id}`}
                        className="ut-display text-xl font-extrabold text-ink hover:text-green-dark"
                      >
                        {lead.club_name}
                      </Link>
                      <StatusBadge status={lead.crm_status} />
                      {lead.locality ? (
                        <span className="text-sm text-ink-faint">
                          {lead.locality}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-[15px] font-medium text-ink">
                      {lead.name || "Tournament"}
                      {lead.age_groups ? (
                        <span className="font-normal text-ink-muted">
                          {" "}
                          · {lead.age_groups}
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-1 text-sm text-ink-muted">
                      <span className="font-medium text-ink">
                        {formatEventDates(lead.start_date, lead.end_date)}
                      </span>
                      {lead.registration_date
                        ? ` · registration ${lead.registration_date}`
                        : ""}
                      {lead.confidence != null
                        ? ` · ${Math.round(lead.confidence * 100)}% confidence`
                        : ""}
                    </p>
                    {lead.summary ? (
                      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-muted">
                        {lead.summary}
                      </p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                      {sources.length > 0 ? (
                        sources.map((s, i) => (
                          <EvidenceLink
                            key={`${s.evidence_url}-${i}`}
                            source={s.source}
                            url={s.evidence_url}
                          />
                        ))
                      ) : (
                        <EvidenceLink
                          source={lead.evidence_source}
                          url={lead.evidence_url}
                        />
                      )}
                    </div>
                  </div>
                  <div className="w-full shrink-0 space-y-3 lg:w-64">
                    <div>
                      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-ink-faint">
                        Channels
                      </p>
                      <ChannelLinks
                        website={lead.website_url}
                        facebook={lead.facebook_url}
                        instagram={lead.instagram_url}
                      />
                    </div>
                    <div>
                      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-ink-faint">
                        Contacts
                      </p>
                      <ContactList contacts={contacts} limit={2} />
                    </div>
                    <Link
                      href={`/intel/clubs/${lead.club_id}`}
                      className="inline-flex text-sm font-medium text-green-dark hover:underline"
                    >
                      Open club CRM →
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

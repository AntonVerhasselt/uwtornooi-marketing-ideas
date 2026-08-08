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
  getSeasonalRecurrenceLeads,
  type PipelineEventLead,
  type SeasonalRecurrenceLead,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tournament lead CRM",
  description: "Upcoming club tournaments with contacts and source evidence",
};

/** Events whose start dates fall within this window are shown as one tournament. */
const GROUP_WINDOW_DAYS = 30;

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

function daysBetween(a: string, b: string): number {
  const ms = Math.abs(Date.parse(a) - Date.parse(b));
  return ms / (1000 * 60 * 60 * 24);
}

/** Collapse year / punctuation so "Absolute Teamsport Cup" matches age variants. */
function normalizeTournamentName(name: string | null): string {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/\b20\d{2}\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

type TournamentGroup = {
  id: string;
  kind: "confirmed" | "seasonal";
  names: string[];
  ageGroups: string[];
  startDate: string | null;
  endDate: string | null;
  /** For seasonal: the past edition date this expectation is based on. */
  lastYearDate: string | null;
  registrationDate: string | null;
  summary: string | null;
  confidence: number | null;
  sources: Array<{ source: string | null; evidence_url: string | null }>;
  signalCount: number;
};

function toTournamentGroup(members: PipelineEventLead[]): TournamentGroup {
  const primary = [...members].sort(
    (a, b) => (b.confidence ?? 0) - (a.confidence ?? 0),
  )[0]!;

  const names = [
    ...new Set(
      members.map((m) => m.name?.trim()).filter((n): n is string => Boolean(n)),
    ),
  ];
  if (primary.name) {
    const rest = names.filter(
      (n) => n.toLowerCase() !== primary.name!.toLowerCase(),
    );
    names.splice(0, names.length, primary.name, ...rest);
  }

  const ageGroups = [
    ...new Set(
      members
        .map((m) => m.age_groups?.trim())
        .filter((a): a is string => Boolean(a)),
    ),
  ];

  const starts = members
    .map((m) => m.start_date)
    .filter((d): d is string => Boolean(d))
    .sort();
  const ends = members
    .map((m) => m.end_date || m.start_date)
    .filter((d): d is string => Boolean(d))
    .sort();

  const sources = uniqueSources(
    members.flatMap((m) => {
      const fromEvent = uniqueSources(m.sources);
      if (fromEvent.length > 0) return fromEvent;
      return [
        {
          source: m.evidence_source,
          evidence_url: m.evidence_url,
        },
      ];
    }),
  );

  const confidences = members
    .map((m) => m.confidence)
    .filter((c): c is number => c != null);

  return {
    id: members.map((m) => m.id).join("-"),
    kind: "confirmed",
    names: names.length ? names : ["Tournament"],
    ageGroups,
    startDate: starts[0] ?? null,
    endDate: ends[ends.length - 1] ?? null,
    lastYearDate: null,
    registrationDate: primary.registration_date,
    summary: primary.summary,
    confidence: confidences.length ? Math.max(...confidences) : null,
    sources,
    signalCount: members.length,
  };
}

function seasonalToTournamentGroup(
  lead: SeasonalRecurrenceLead,
): TournamentGroup {
  const sources = uniqueSources(
    lead.sources.length
      ? lead.sources
      : [
          {
            source: lead.evidence_source,
            evidence_url: lead.evidence_url,
          },
        ],
  );

  return {
    id: `seasonal-${lead.id}`,
    kind: "seasonal",
    names: [lead.name?.trim() || "Tournament"],
    ageGroups: lead.age_groups ? [lead.age_groups] : [],
    startDate: lead.expected_date,
    endDate: lead.expected_date,
    lastYearDate: lead.last_year_date,
    registrationDate: null,
    summary: lead.summary,
    confidence: lead.confidence,
    sources,
    signalCount: 1,
  };
}

/**
 * Merge signals that look like the same tournament: same normalised name and
 * start dates within a 30-day window (or undated name matches).
 */
function groupEventsByDateWindow(
  events: PipelineEventLead[],
  windowDays = GROUP_WINDOW_DAYS,
): TournamentGroup[] {
  const byName = new Map<string, PipelineEventLead[]>();
  for (const event of events) {
    const key = normalizeTournamentName(event.name) || `__id:${event.id}`;
    const list = byName.get(key) || [];
    list.push(event);
    byName.set(key, list);
  }

  const groups: PipelineEventLead[][] = [];

  for (const named of byName.values()) {
    const dated = named
      .filter((e) => e.start_date)
      .sort((a, b) => a.start_date!.localeCompare(b.start_date!));
    const undated = named.filter((e) => !e.start_date);

    const windows: PipelineEventLead[][] = [];
    for (const event of dated) {
      const last = windows[windows.length - 1];
      if (
        last?.[0]?.start_date &&
        daysBetween(last[0].start_date, event.start_date!) <= windowDays
      ) {
        last.push(event);
      } else {
        windows.push([event]);
      }
    }

    // Attach undated signals to the first window of that name, or their own group.
    if (undated.length) {
      if (windows[0]) {
        windows[0].push(...undated);
      } else {
        windows.push(undated);
      }
    }

    groups.push(...windows);
  }

  return groups
    .map(toTournamentGroup)
    .sort((a, b) => {
      if (a.startDate && b.startDate) {
        return a.startDate.localeCompare(b.startDate);
      }
      if (a.startDate) return -1;
      if (b.startDate) return 1;
      return (a.names[0] || "").localeCompare(b.names[0] || "");
    });
}

type ClubPipelineGroup = {
  club_id: number;
  club_name: string;
  locality: string | null;
  website_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  crm_status: CrmStatus;
  earliest_date: string | null;
  events: PipelineEventLead[];
  tournaments: TournamentGroup[];
};

function groupLeadsByClub(
  leads: PipelineEventLead[],
  seasonal: SeasonalRecurrenceLead[],
): ClubPipelineGroup[] {
  const byClub = new Map<number, ClubPipelineGroup>();

  for (const lead of leads) {
    const existing = byClub.get(lead.club_id);
    if (!existing) {
      byClub.set(lead.club_id, {
        club_id: lead.club_id,
        club_name: lead.club_name,
        locality: lead.locality,
        website_url: lead.website_url,
        facebook_url: lead.facebook_url,
        instagram_url: lead.instagram_url,
        crm_status: lead.crm_status,
        earliest_date: lead.start_date,
        events: [lead],
        tournaments: [],
      });
      continue;
    }

    existing.events.push(lead);
    if (
      lead.start_date &&
      (!existing.earliest_date || lead.start_date < existing.earliest_date)
    ) {
      existing.earliest_date = lead.start_date;
    }
  }

  for (const club of byClub.values()) {
    club.tournaments = groupEventsByDateWindow(club.events);
  }

  // Clubs with only a seasonal signal (no confirmed upcoming post yet).
  for (const s of seasonal) {
    const existing = byClub.get(s.club_id);
    const card = seasonalToTournamentGroup(s);
    if (!existing) {
      byClub.set(s.club_id, {
        club_id: s.club_id,
        club_name: s.club_name,
        locality: s.locality,
        website_url: s.website_url,
        facebook_url: s.facebook_url,
        instagram_url: s.instagram_url,
        crm_status: s.crm_status,
        earliest_date: s.expected_date,
        events: [],
        tournaments: [card],
      });
      continue;
    }
    existing.tournaments.push(card);
    if (
      !existing.earliest_date ||
      s.expected_date < existing.earliest_date
    ) {
      existing.earliest_date = s.expected_date;
    }
  }

  for (const club of byClub.values()) {
    club.tournaments.sort((a, b) => {
      // Confirmed first, then by date
      if (a.kind !== b.kind) return a.kind === "confirmed" ? -1 : 1;
      if (a.startDate && b.startDate) {
        return a.startDate.localeCompare(b.startDate);
      }
      if (a.startDate) return -1;
      if (b.startDate) return 1;
      return (a.names[0] || "").localeCompare(b.names[0] || "");
    });
  }

  return [...byClub.values()].sort((a, b) => {
    if (a.earliest_date && b.earliest_date) {
      return a.earliest_date.localeCompare(b.earliest_date);
    }
    if (a.earliest_date) return -1;
    if (b.earliest_date) return 1;
    return a.club_name.localeCompare(b.club_name);
  });
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

  const statusOpt = statusFilter === "all" ? "all" : statusFilter;
  const [stats, leads, seasonal] = await Promise.all([
    getDashboardStats(),
    getPipelineEventLeads({ status: statusOpt, limit: 80 }),
    getSeasonalRecurrenceLeads({ status: statusOpt, limit: 80 }),
  ]);

  const clubs = groupLeadsByClub(leads, seasonal);
  const clubIds = clubs.map((c) => c.club_id);
  const contactsByClub = await getContactsForClubs(clubIds);
  const seasonalOnlyClubs = clubs.filter((c) =>
    c.tournaments.every((t) => t.kind === "seasonal"),
  ).length;

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
            Confirmed upcoming tournaments from posts/blogs, plus seasonal
            expectations when a club ran a cup in the same month last year.
            Same-named signals within {GROUP_WINDOW_DAYS} days are grouped.
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
        <Stat label="Confirmed upcoming" value={stats.upcomingTournaments} />
        <Stat label="Seasonal (same month LY)" value={stats.seasonalClubs} />
        <Stat
          label="Clubs in pipeline"
          value={stats.upcomingClubs + seasonalOnlyClubs}
        />
        <Stat label="Contacts loaded" value={stats.contactsLoaded} />
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

      {clubs.length === 0 ? (
        <p className="rounded-[11px] border border-border bg-bg-elevated/70 px-5 py-8 text-sm text-ink-muted">
          No upcoming or seasonal tournament leads match this filter. Run scrape
          + analyze, or clear the status filter.
        </p>
      ) : (
        <>
        <p className="mb-4 text-xs text-ink-faint">
          Solid cards = confirmed from a post/blog.{" "}
          <span className="text-amber-900/80">
            Dashed amber cards = seasonal expectation (same month last year, no
            new date found yet).
          </span>
        </p>
        <ul className="space-y-5">
          {clubs.map((club) => {
            const contacts = contactsByClub.get(club.club_id) || [];
            return (
              <li
                key={club.club_id}
                className="rounded-[14px] border border-border bg-bg-elevated/75 px-5 py-5 shadow-[var(--shadow-soft)]"
              >
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <Link
                    href={`/intel/clubs/${club.club_id}`}
                    className="ut-display text-xl font-extrabold text-ink hover:text-green-dark"
                  >
                    {club.club_name}
                  </Link>
                  <StatusBadge status={club.crm_status} />
                  {club.locality ? (
                    <span className="text-sm text-ink-faint">
                      {club.locality}
                    </span>
                  ) : null}
                  <span className="rounded-[8px] border border-border bg-bg px-2 py-0.5 text-xs font-medium text-ink-muted">
                    {club.tournaments.length} tournament
                    {club.tournaments.length === 1 ? "" : "s"}
                  </span>
                  {club.tournaments.some((t) => t.kind === "seasonal") ? (
                    <span className="rounded-[8px] border border-amber-500/40 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-900">
                      Includes seasonal
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <ul className="min-w-0 flex-1 space-y-2">
                    {club.tournaments.map((tournament) => {
                      const [primaryName, ...otherNames] = tournament.names;
                      const seasonal = tournament.kind === "seasonal";
                      return (
                        <li
                          key={tournament.id}
                          className={
                            seasonal
                              ? "rounded-[11px] border border-dashed border-amber-500/50 bg-amber-50/40 px-3.5 py-3"
                              : "rounded-[11px] border border-border bg-bg px-3.5 py-3"
                          }
                        >
                          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                            <p className="text-sm font-semibold text-ink">
                              {primaryName}
                              {tournament.ageGroups.length > 0 ? (
                                <span className="font-normal text-ink-muted">
                                  {" "}
                                  · {tournament.ageGroups.join(", ")}
                                </span>
                              ) : null}
                            </p>
                            <p className="shrink-0 text-xs tabular-nums text-ink-muted">
                              <span className="font-medium text-ink">
                                {seasonal ? "~" : ""}
                                {formatEventDates(
                                  tournament.startDate,
                                  tournament.endDate,
                                )}
                              </span>
                              {!seasonal && tournament.confidence != null
                                ? ` · ${Math.round(tournament.confidence * 100)}%`
                                : ""}
                            </p>
                          </div>

                          {seasonal ? (
                            <p className="mt-1 text-xs text-amber-900/80">
                              Expected — organised{" "}
                              <span className="font-medium">
                                {tournament.lastYearDate}
                              </span>{" "}
                              (same month last year). No {tournament.startDate?.slice(0, 4)}{" "}
                              date confirmed yet.
                            </p>
                          ) : tournament.signalCount > 1 ? (
                            <p className="mt-0.5 text-xs text-ink-faint">
                              {tournament.signalCount} posts grouped
                              {otherNames.length > 0
                                ? ` · also ${otherNames.join(" · ")}`
                                : ""}
                            </p>
                          ) : null}

                          {tournament.summary ? (
                            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ink-muted">
                              {tournament.summary}
                            </p>
                          ) : null}

                          {tournament.sources.length > 0 ? (
                            <ul className="mt-2 flex flex-wrap gap-1.5">
                              {tournament.sources.map((s, i) => (
                                <li
                                  key={`${s.evidence_url || "none"}-${i}`}
                                  className="rounded-[8px] border border-border/70 bg-bg-elevated/90 px-2 py-1"
                                >
                                  <EvidenceLink
                                    source={s.source}
                                    url={s.evidence_url}
                                    compact
                                  />
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>

                  <div className="w-full shrink-0 space-y-3 lg:w-64">
                    <div>
                      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-ink-faint">
                        Channels
                      </p>
                      <ChannelLinks
                        website={club.website_url}
                        facebook={club.facebook_url}
                        instagram={club.instagram_url}
                      />
                    </div>
                    <div>
                      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-ink-faint">
                        Contacts
                      </p>
                      <ContactList contacts={contacts} limit={2} />
                    </div>
                    <Link
                      href={`/intel/clubs/${club.club_id}`}
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
        </>
      )}
    </main>
  );
}

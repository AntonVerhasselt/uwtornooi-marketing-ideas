import { connection } from "next/server";
import {
  getDb,
  type ClubContactRow,
  type ClubRow,
  type CrmStatus,
  type PostRow,
  type TournamentEventRow,
  type TournamentEventSourceRow,
  type TournamentRow,
} from "./db";
import { resolveEvidenceUrl } from "./crm";

export type DashboardStats = {
  totalClubs: number;
  websitesCrawled: number;
  facebookPagesFound: number;
  instagramFound: number;
  tournamentPosts: number;
  upcomingTournaments: number;
  upcomingClubs: number;
  /** Clubs with a same-month-last-year signal and no confirmed date yet. */
  seasonalClubs: number;
  contactsLoaded: number;
  candidatePosts: number;
  analyzedCandidates: number;
};

export type ClubListItem = ClubRow & {
  tournament_count: number;
  last_tournament: string | null;
  next_tournament: string | null;
  contact_count: number;
  reachable_contacts: number;
};

export type TournamentEvidence = TournamentRow & {
  club_name: string;
  locality: string | null;
  website_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  crm_status: CrmStatus;
  evidence_source: string | null;
  evidence_url: string | null;
  post_date: string | null;
  post_snippet: string | null;
};

export type ClubTournamentEvidence = TournamentRow & {
  evidence_source: string | null;
  evidence_url: string | null;
  post_date: string | null;
  post_text: string | null;
};

export type EventSourceEvidence = TournamentEventSourceRow & {
  evidence_url: string | null;
};

export type ClubTournamentEvent = TournamentEventRow & {
  sources: EventSourceEvidence[];
};

export type PipelineEventLead = TournamentEventRow & {
  club_name: string;
  locality: string | null;
  website_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  crm_status: CrmStatus;
  evidence_source: string | null;
  evidence_url: string | null;
  sources: EventSourceEvidence[];
};

/** Past tournament projected forward one year (seasonal recurrence). */
export type SeasonalRecurrenceLead = {
  id: number;
  club_id: number;
  club_name: string;
  locality: string | null;
  website_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  crm_status: CrmStatus;
  name: string | null;
  category: string | null;
  age_groups: string | null;
  /** Original past event date (e.g. 2025-11-12). */
  last_year_date: string;
  /** Projected next occurrence (last_year_date + 1 year). */
  expected_date: string;
  summary: string | null;
  confidence: number | null;
  evidence_source: string | null;
  evidence_url: string | null;
  sources: EventSourceEvidence[];
};

function addOneYear(isoDate: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!m) return null;
  const year = Number(m[1]) + 1;
  const month = m[2];
  const day = m[3];
  // Clamp Feb 29 → Feb 28 on non-leap years
  if (month === "02" && day === "29") {
    const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    return `${year}-02-${leap ? "29" : "28"}`;
  }
  return `${year}-${month}-${day}`;
}

function addMonths(isoDate: string, deltaMonths: number): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!m) return null;
  const dt = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  dt.setUTCMonth(dt.getUTCMonth() + deltaMonths);
  return dt.toISOString().slice(0, 10);
}

function normalizeNameKey(name: string | null | undefined): string {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/\b20\d{2}\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function monthKey(isoDate: string): string {
  return isoDate.slice(5, 7);
}

function hasTournamentEvents(): boolean {
  const row = getDb()
    .prepare(`SELECT COUNT(*) AS c FROM tournament_events`)
    .get() as { c: number };
  return row.c > 0;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await connection();
  const db = getDb();
  const today = new Date().toISOString().slice(0, 10);
  const useEvents = hasTournamentEvents();

  const upcomingTournaments = useEvents
    ? (
        db
          .prepare(
            `SELECT COUNT(*) AS c FROM tournament_events
             WHERE start_date IS NOT NULL AND start_date >= ?`,
          )
          .get(today) as { c: number }
      ).c
    : (
        db
          .prepare(
            `SELECT COUNT(*) AS c FROM tournaments WHERE event_date IS NOT NULL AND event_date >= ?`,
          )
          .get(today) as { c: number }
      ).c;

  const upcomingClubs = useEvents
    ? (
        db
          .prepare(
            `SELECT COUNT(DISTINCT club_id) AS c FROM tournament_events
             WHERE start_date IS NOT NULL AND start_date >= ?`,
          )
          .get(today) as { c: number }
      ).c
    : (
        db
          .prepare(
            `SELECT COUNT(DISTINCT club_id) AS c FROM tournaments
             WHERE event_date IS NOT NULL AND event_date >= ?`,
          )
          .get(today) as { c: number }
      ).c;

  const seasonal = await getSeasonalRecurrenceLeads({ limit: 200 });

  return {
    totalClubs: (
      db.prepare(`SELECT COUNT(*) AS c FROM clubs`).get() as { c: number }
    ).c,
    websitesCrawled: (
      db
        .prepare(
          `SELECT COUNT(*) AS c FROM clubs WHERE crawled_at IS NOT NULL`,
        )
        .get() as { c: number }
    ).c,
    facebookPagesFound: (
      db
        .prepare(
          `SELECT COUNT(*) AS c FROM clubs WHERE facebook_url IS NOT NULL AND facebook_url != ''`,
        )
        .get() as { c: number }
    ).c,
    instagramFound: (
      db
        .prepare(
          `SELECT COUNT(*) AS c FROM clubs WHERE instagram_url IS NOT NULL AND instagram_url != ''`,
        )
        .get() as { c: number }
    ).c,
    tournamentPosts: (
      db.prepare(`SELECT COUNT(*) AS c FROM posts`).get() as { c: number }
    ).c,
    upcomingTournaments,
    upcomingClubs,
    seasonalClubs: new Set(seasonal.map((s) => s.club_id)).size,
    contactsLoaded: (
      db.prepare(`SELECT COUNT(*) AS c FROM club_contacts`).get() as {
        c: number;
      }
    ).c,
    candidatePosts: (
      db.prepare(`SELECT COUNT(*) AS c FROM candidate_posts`).get() as {
        c: number;
      }
    ).c,
    analyzedCandidates: (
      db
        .prepare(`SELECT COUNT(*) AS c FROM candidate_posts WHERE analyzed = 1`)
        .get() as { c: number }
    ).c,
  };
}

export async function listClubs(search?: string): Promise<ClubListItem[]> {
  await connection();
  const db = getDb();
  const today = new Date().toISOString().slice(0, 10);
  const q = `
    SELECT
      c.*,
      CASE
        WHEN (SELECT COUNT(*) FROM tournament_events e WHERE e.club_id = c.id) > 0
          THEN (SELECT COUNT(*) FROM tournament_events e WHERE e.club_id = c.id)
        ELSE (SELECT COUNT(*) FROM tournaments t WHERE t.club_id = c.id)
      END AS tournament_count,
      CASE
        WHEN (SELECT COUNT(*) FROM tournament_events e WHERE e.club_id = c.id) > 0
          THEN (
            SELECT MAX(e.start_date) FROM tournament_events e
            WHERE e.club_id = c.id AND e.start_date IS NOT NULL AND e.start_date < ?
          )
        ELSE (
          SELECT MAX(t.event_date) FROM tournaments t
          WHERE t.club_id = c.id AND t.event_date IS NOT NULL AND t.event_date < ?
        )
      END AS last_tournament,
      CASE
        WHEN (SELECT COUNT(*) FROM tournament_events e WHERE e.club_id = c.id) > 0
          THEN (
            SELECT MIN(e.start_date) FROM tournament_events e
            WHERE e.club_id = c.id AND e.start_date IS NOT NULL AND e.start_date >= ?
          )
        ELSE (
          SELECT MIN(t.event_date) FROM tournaments t
          WHERE t.club_id = c.id AND t.event_date IS NOT NULL AND t.event_date >= ?
        )
      END AS next_tournament,
      (SELECT COUNT(*) FROM club_contacts cc WHERE cc.club_id = c.id) AS contact_count,
      (SELECT COUNT(*) FROM club_contacts cc WHERE cc.club_id = c.id AND (cc.email IS NOT NULL OR cc.phone IS NOT NULL)) AS reachable_contacts
    FROM clubs c
    WHERE (? = '' OR c.name LIKE ? OR EXISTS (
      SELECT 1 FROM tournament_events e
      WHERE e.club_id = c.id AND e.name LIKE ?
    ) OR EXISTS (
      SELECT 1 FROM tournaments t
      WHERE t.club_id = c.id AND t.tournament_name LIKE ?
    ))
    ORDER BY
      CASE WHEN next_tournament IS NOT NULL THEN 0 ELSE 1 END,
      next_tournament ASC,
      tournament_count DESC,
      c.name ASC
  `;
  const term = (search || "").trim();
  const like = `%${term}%`;
  return db
    .prepare(q)
    .all(today, today, today, today, term, like, like, like) as ClubListItem[];
}

export async function getClub(id: number): Promise<ClubRow | null> {
  await connection();
  const row = getDb().prepare(`SELECT * FROM clubs WHERE id = ?`).get(id);
  return (row as ClubRow) || null;
}

export async function getClubContacts(
  clubId: number,
): Promise<ClubContactRow[]> {
  await connection();
  return getDb()
    .prepare(
      `SELECT * FROM club_contacts
       WHERE club_id = ?
       ORDER BY
         CASE WHEN email IS NOT NULL OR phone IS NOT NULL THEN 0 ELSE 1 END,
         last_name ASC, first_name ASC`,
    )
    .all(clubId) as ClubContactRow[];
}

export async function getClubTournaments(
  clubId: number,
): Promise<TournamentRow[]> {
  await connection();
  return getDb()
    .prepare(
      `SELECT * FROM tournaments WHERE club_id = ? ORDER BY
        CASE WHEN event_date IS NULL THEN 1 ELSE 0 END,
        event_date DESC,
        created_at DESC`,
    )
    .all(clubId) as TournamentRow[];
}

export async function getClubTournamentsWithEvidence(
  clubId: number,
): Promise<ClubTournamentEvidence[]> {
  await connection();
  const rows = getDb()
    .prepare(
      `SELECT
         t.*,
         cp.source AS evidence_source,
         COALESCE(NULLIF(cp.source_url, ''), NULLIF(p.facebook_post_url, '')) AS evidence_url,
         p.post_date AS post_date,
         p.post_text AS post_text
       FROM tournaments t
       LEFT JOIN posts p ON p.id = t.post_id
       LEFT JOIN candidate_posts cp ON cp.id = p.candidate_post_id
       WHERE t.club_id = ?
       ORDER BY
         CASE WHEN t.event_date IS NULL THEN 1 ELSE 0 END,
         t.event_date DESC,
         t.created_at DESC`,
    )
    .all(clubId) as ClubTournamentEvidence[];

  return rows.map((r) => ({
    ...r,
    evidence_url: resolveEvidenceUrl(r.evidence_url, null),
  }));
}

function loadEventSources(eventIds: number[]): Map<number, EventSourceEvidence[]> {
  const map = new Map<number, EventSourceEvidence[]>();
  if (!eventIds.length) return map;

  const placeholders = eventIds.map(() => "?").join(",");
  const rows = getDb()
    .prepare(
      `SELECT * FROM tournament_event_sources
       WHERE event_id IN (${placeholders})
       ORDER BY id ASC`,
    )
    .all(...eventIds) as TournamentEventSourceRow[];

  for (const row of rows) {
    const list = map.get(row.event_id) || [];
    list.push({
      ...row,
      evidence_url: resolveEvidenceUrl(row.source_url, null),
    });
    map.set(row.event_id, list);
  }
  return map;
}

export async function getClubTournamentEvents(
  clubId: number,
): Promise<ClubTournamentEvent[]> {
  await connection();
  const events = getDb()
    .prepare(
      `SELECT * FROM tournament_events
       WHERE club_id = ?
       ORDER BY
         CASE WHEN start_date IS NULL THEN 1 ELSE 0 END,
         start_date DESC,
         created_at DESC`,
    )
    .all(clubId) as TournamentEventRow[];

  const sourcesByEvent = loadEventSources(events.map((e) => e.id));
  return events.map((e) => ({
    ...e,
    sources: sourcesByEvent.get(e.id) || [],
  }));
}

export async function getClubPosts(
  clubId: number,
): Promise<
  Array<
    PostRow & {
      tournament_name: string | null;
      confidence: number | null;
      evidence_source: string | null;
      evidence_url: string | null;
    }
  >
> {
  await connection();
  return getDb()
    .prepare(
      `SELECT
         p.*,
         t.tournament_name,
         t.confidence,
         cp.source AS evidence_source,
         COALESCE(NULLIF(cp.source_url, ''), NULLIF(p.facebook_post_url, '')) AS evidence_url
       FROM posts p
       LEFT JOIN tournaments t ON t.post_id = p.id
       LEFT JOIN candidate_posts cp ON cp.id = p.candidate_post_id
       WHERE p.club_id = ?
       ORDER BY p.post_date DESC, p.created_at DESC`,
    )
    .all(clubId) as Array<
    PostRow & {
      tournament_name: string | null;
      confidence: number | null;
      evidence_source: string | null;
      evidence_url: string | null;
    }
  >;
}

export async function getUpcomingTournaments(
  limit = 20,
): Promise<Array<TournamentRow & { club_name: string }>> {
  await connection();
  const today = new Date().toISOString().slice(0, 10);
  return getDb()
    .prepare(
      `SELECT t.*, c.name AS club_name
       FROM tournaments t
       JOIN clubs c ON c.id = t.club_id
       WHERE t.event_date IS NOT NULL AND t.event_date >= ?
       ORDER BY t.event_date ASC
       LIMIT ?`,
    )
    .all(today, limit) as Array<TournamentRow & { club_name: string }>;
}

/** Full CRM pipeline: upcoming tournaments with evidence + club channels. */
export async function getPipelineLeads(
  opts: { status?: CrmStatus | "all"; limit?: number } = {},
): Promise<TournamentEvidence[]> {
  await connection();
  const today = new Date().toISOString().slice(0, 10);
  const limit = opts.limit ?? 100;
  const status = opts.status && opts.status !== "all" ? opts.status : null;

  const rows = getDb()
    .prepare(
      `SELECT
         t.*,
         c.name AS club_name,
         c.locality,
         c.website_url,
         c.facebook_url,
         c.instagram_url,
         c.crm_status,
         cp.source AS evidence_source,
         COALESCE(NULLIF(cp.source_url, ''), NULLIF(p.facebook_post_url, '')) AS evidence_url,
         p.post_date,
         CASE
           WHEN length(p.post_text) > 180 THEN substr(p.post_text, 1, 180) || '…'
           ELSE p.post_text
         END AS post_snippet
       FROM tournaments t
       JOIN clubs c ON c.id = t.club_id
       LEFT JOIN posts p ON p.id = t.post_id
       LEFT JOIN candidate_posts cp ON cp.id = p.candidate_post_id
       WHERE t.event_date IS NOT NULL AND t.event_date >= ?
         AND (? IS NULL OR c.crm_status = ?)
       ORDER BY t.event_date ASC, c.name ASC
       LIMIT ?`,
    )
    .all(today, status, status, limit) as TournamentEvidence[];

  return rows;
}

/** Pipeline leads from clustered tournament_events (preferred when clustered). */
export async function getPipelineEventLeads(
  opts: { status?: CrmStatus | "all"; limit?: number } = {},
): Promise<PipelineEventLead[]> {
  await connection();
  const today = new Date().toISOString().slice(0, 10);
  const limit = opts.limit ?? 100;
  const status = opts.status && opts.status !== "all" ? opts.status : null;

  if (!hasTournamentEvents()) {
    // Fall back to raw tournament signals shaped as event leads.
    // Also pull undated signals for those clubs (registration pages, etc.)
    // so the UI can group them with the matching upcoming tournament.
    const raw = await getPipelineLeads(opts);
    const clubIds = [...new Set(raw.map((r) => r.club_id))];
    const seenIds = new Set(raw.map((r) => r.id));
    const extras =
      clubIds.length === 0
        ? []
        : (getDb()
            .prepare(
              `SELECT
                 t.*,
                 c.name AS club_name,
                 c.locality,
                 c.website_url,
                 c.facebook_url,
                 c.instagram_url,
                 c.crm_status,
                 cp.source AS evidence_source,
                 COALESCE(NULLIF(cp.source_url, ''), NULLIF(p.facebook_post_url, '')) AS evidence_url,
                 p.post_date,
                 CASE
                   WHEN length(p.post_text) > 180 THEN substr(p.post_text, 1, 180) || '…'
                   ELSE p.post_text
                 END AS post_snippet
               FROM tournaments t
               JOIN clubs c ON c.id = t.club_id
               LEFT JOIN posts p ON p.id = t.post_id
               LEFT JOIN candidate_posts cp ON cp.id = p.candidate_post_id
               WHERE t.club_id IN (${clubIds.map(() => "?").join(",")})
                 AND (t.event_date IS NULL OR t.event_date = '')
                 AND (? IS NULL OR c.crm_status = ?)`,
            )
            .all(...clubIds, status, status) as TournamentEvidence[]);

    const combined = [
      ...raw,
      ...extras.filter((r) => !seenIds.has(r.id)),
    ];

    return combined.map((r) => ({
      id: r.id,
      club_id: r.club_id,
      name: r.tournament_name,
      category: r.category,
      age_groups: r.age_group,
      start_date: r.event_date,
      end_date: r.event_date,
      registration_date: r.registration_date,
      summary: r.summary,
      confidence: r.confidence,
      created_at: r.created_at,
      club_name: r.club_name,
      locality: r.locality,
      website_url: r.website_url,
      facebook_url: r.facebook_url,
      instagram_url: r.instagram_url,
      crm_status: r.crm_status,
      evidence_source: r.evidence_source,
      evidence_url: resolveEvidenceUrl(r.evidence_url, null),
      sources: r.evidence_url
        ? [
            {
              id: 0,
              event_id: r.id,
              tournament_id: r.id,
              post_id: r.post_id,
              source: r.evidence_source,
              source_url: r.evidence_url,
              evidence_url: resolveEvidenceUrl(r.evidence_url, null),
            },
          ]
        : [],
    }));
  }

  const events = getDb()
    .prepare(
      `SELECT
         e.*,
         c.name AS club_name,
         c.locality,
         c.website_url,
         c.facebook_url,
         c.instagram_url,
         c.crm_status
       FROM tournament_events e
       JOIN clubs c ON c.id = e.club_id
       WHERE e.start_date IS NOT NULL AND e.start_date >= ?
         AND (? IS NULL OR c.crm_status = ?)
       ORDER BY e.start_date ASC, c.name ASC
       LIMIT ?`,
    )
    .all(today, status, status, limit) as Array<
    TournamentEventRow & {
      club_name: string;
      locality: string | null;
      website_url: string | null;
      facebook_url: string | null;
      instagram_url: string | null;
      crm_status: CrmStatus;
    }
  >;

  const sourcesByEvent = loadEventSources(events.map((e) => e.id));

  return events.map((e) => {
    const sources = sourcesByEvent.get(e.id) || [];
    const primary = sources[0];
    return {
      ...e,
      evidence_source: primary?.source ?? null,
      evidence_url: primary?.evidence_url ?? null,
      sources,
    };
  });
}

/**
 * Clubs that organised a tournament around this time last year, with no
 * confirmed upcoming date yet for that same cup / month.
 * Projected date = past event date + 1 year.
 */
export async function getSeasonalRecurrenceLeads(
  opts: { status?: CrmStatus | "all"; limit?: number } = {},
): Promise<SeasonalRecurrenceLead[]> {
  await connection();
  const today = new Date().toISOString().slice(0, 10);
  const limit = opts.limit ?? 80;
  const status = opts.status && opts.status !== "all" ? opts.status : null;

  // Recent history only (skip ancient OCR/parse junk like 2002).
  const historyFrom = addMonths(today, -18);
  // Look ahead up to 12 months for the projected anniversary.
  const horizon = addOneYear(today);
  if (!historyFrom || !horizon) return [];

  type PastRow = {
    id: number;
    club_id: number;
    name: string | null;
    category: string | null;
    age_groups: string | null;
    last_year_date: string;
    summary: string | null;
    confidence: number | null;
    club_name: string;
    locality: string | null;
    website_url: string | null;
    facebook_url: string | null;
    instagram_url: string | null;
    crm_status: CrmStatus;
    evidence_source: string | null;
    evidence_url: string | null;
    post_id: number | null;
  };

  const useEvents = hasTournamentEvents();

  const pastRows = (
    useEvents
      ? (getDb()
          .prepare(
            `SELECT
               e.id,
               e.club_id,
               e.name,
               e.category,
               e.age_groups,
               e.start_date AS last_year_date,
               e.summary,
               e.confidence,
               c.name AS club_name,
               c.locality,
               c.website_url,
               c.facebook_url,
               c.instagram_url,
               c.crm_status,
               NULL AS evidence_source,
               NULL AS evidence_url,
               NULL AS post_id
             FROM tournament_events e
             JOIN clubs c ON c.id = e.club_id
             WHERE e.start_date IS NOT NULL
               AND e.start_date >= ?
               AND e.start_date < ?
               AND (? IS NULL OR c.crm_status = ?)
             ORDER BY e.start_date DESC`,
          )
          .all(historyFrom, today, status, status) as PastRow[])
      : (getDb()
          .prepare(
            `SELECT
               t.id,
               t.club_id,
               t.tournament_name AS name,
               t.category,
               t.age_group AS age_groups,
               t.event_date AS last_year_date,
               t.summary,
               t.confidence,
               c.name AS club_name,
               c.locality,
               c.website_url,
               c.facebook_url,
               c.instagram_url,
               c.crm_status,
               cp.source AS evidence_source,
               COALESCE(NULLIF(cp.source_url, ''), NULLIF(p.facebook_post_url, '')) AS evidence_url,
               t.post_id
             FROM tournaments t
             JOIN clubs c ON c.id = t.club_id
             LEFT JOIN posts p ON p.id = t.post_id
             LEFT JOIN candidate_posts cp ON cp.id = p.candidate_post_id
             WHERE t.event_date IS NOT NULL
               AND t.event_date >= ?
               AND t.event_date < ?
               AND (? IS NULL OR c.crm_status = ?)
             ORDER BY t.event_date DESC`,
          )
          .all(historyFrom, today, status, status) as PastRow[])
  ).map((r) => ({
    ...r,
    evidence_url: resolveEvidenceUrl(r.evidence_url, null),
  }));

  // Confirmed upcoming — used to suppress seasonal duplicates.
  const upcoming = await getPipelineEventLeads({
    status: opts.status ?? "all",
    limit: 500,
  });
  const upcomingByClub = new Map<number, PipelineEventLead[]>();
  for (const u of upcoming) {
    const list = upcomingByClub.get(u.club_id) || [];
    list.push(u);
    upcomingByClub.set(u.club_id, list);
  }

  const eventIds = useEvents ? pastRows.map((r) => r.id) : [];
  const sourcesByEvent = useEvents ? loadEventSources(eventIds) : new Map();

  const out: SeasonalRecurrenceLead[] = [];
  const seen = new Set<string>();

  for (const row of pastRows) {
    const expected = addOneYear(row.last_year_date);
    if (!expected || expected < today || expected > horizon) continue;

    const nameKey = normalizeNameKey(row.name);
    const month = monthKey(expected);
    const clubUpcoming = upcomingByClub.get(row.club_id) || [];

    const alreadyConfirmed = clubUpcoming.some((u) => {
      if (!u.start_date) return false;
      const sameMonth = monthKey(u.start_date) === month;
      const sameName =
        nameKey.length > 0 && normalizeNameKey(u.name) === nameKey;
      // Suppress if same cup name, or any confirmed event in that calendar month.
      return sameName || sameMonth;
    });
    if (alreadyConfirmed) continue;

    const dedupeKey = `${row.club_id}|${nameKey || row.id}|${month}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    const sources: EventSourceEvidence[] = useEvents
      ? sourcesByEvent.get(row.id) || []
      : row.evidence_url
        ? [
            {
              id: 0,
              event_id: row.id,
              tournament_id: row.id,
              post_id: row.post_id,
              source: row.evidence_source,
              source_url: row.evidence_url,
              evidence_url: row.evidence_url,
            },
          ]
        : [];

    const primary = sources[0];
    out.push({
      id: row.id,
      club_id: row.club_id,
      club_name: row.club_name,
      locality: row.locality,
      website_url: row.website_url,
      facebook_url: row.facebook_url,
      instagram_url: row.instagram_url,
      crm_status: row.crm_status,
      name: row.name,
      category: row.category,
      age_groups: row.age_groups,
      last_year_date: row.last_year_date,
      expected_date: expected,
      summary: row.summary,
      confidence: row.confidence,
      evidence_source: primary?.source ?? row.evidence_source,
      evidence_url: primary?.evidence_url ?? row.evidence_url,
      sources,
    });

    if (out.length >= limit) break;
  }

  out.sort((a, b) => a.expected_date.localeCompare(b.expected_date));
  return out;
}

export async function getContactsForClubs(
  clubIds: number[],
): Promise<Map<number, ClubContactRow[]>> {
  await connection();
  const map = new Map<number, ClubContactRow[]>();
  if (clubIds.length === 0) return map;

  const placeholders = clubIds.map(() => "?").join(",");
  const rows = getDb()
    .prepare(
      `SELECT * FROM club_contacts
       WHERE club_id IN (${placeholders})
       ORDER BY
         CASE WHEN email IS NOT NULL OR phone IS NOT NULL THEN 0 ELSE 1 END,
         last_name ASC`,
    )
    .all(...clubIds) as ClubContactRow[];

  for (const row of rows) {
    const list = map.get(row.club_id) || [];
    list.push(row);
    map.set(row.club_id, list);
  }
  return map;
}

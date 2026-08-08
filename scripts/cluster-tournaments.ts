import {
  clusterClubTournaments,
  type TournamentSignal,
} from "../src/lib/cluster";
import { getDb, logScrape } from "../src/lib/db";

type ClubWithTournaments = {
  id: number;
  name: string;
  signal_count: number;
};

type SignalRow = {
  id: number;
  club_id: number;
  post_id: number | null;
  tournament_name: string | null;
  category: string | null;
  age_group: string | null;
  event_date: string | null;
  registration_date: string | null;
  summary: string | null;
  confidence: number | null;
  evidence_source: string | null;
  evidence_url: string | null;
  post_snippet: string | null;
};

function parseArgs(argv: string[]): { clubFilter: string | null; dryRun: boolean } {
  let clubFilter: string | null = null;
  let dryRun = false;
  for (const arg of argv) {
    if (arg === "--dry-run") dryRun = true;
    else if (arg.startsWith("--club=")) {
      clubFilter = arg.slice("--club=".length).trim() || null;
    }
  }
  return { clubFilter, dryRun };
}

function loadSignals(clubId: number): SignalRow[] {
  return getDb()
    .prepare(
      `SELECT
         t.id,
         t.club_id,
         t.post_id,
         t.tournament_name,
         t.category,
         t.age_group,
         t.event_date,
         t.registration_date,
         t.summary,
         t.confidence,
         cp.source AS evidence_source,
         COALESCE(NULLIF(cp.source_url, ''), NULLIF(p.facebook_post_url, '')) AS evidence_url,
         CASE
           WHEN length(p.post_text) > 280 THEN substr(p.post_text, 1, 280) || '…'
           ELSE p.post_text
         END AS post_snippet
       FROM tournaments t
       LEFT JOIN posts p ON p.id = t.post_id
       LEFT JOIN candidate_posts cp ON cp.id = p.candidate_post_id
       WHERE t.club_id = ?
       ORDER BY t.id ASC`,
    )
    .all(clubId) as SignalRow[];
}

function toSignals(rows: SignalRow[]): TournamentSignal[] {
  return rows.map((r) => ({
    id: r.id,
    tournamentName: r.tournament_name,
    category: r.category,
    ageGroup: r.age_group,
    eventDate: r.event_date,
    registrationDate: r.registration_date,
    summary: r.summary,
    confidence: r.confidence,
    source: r.evidence_source,
    sourceUrl: r.evidence_url,
    postSnippet: r.post_snippet,
  }));
}

function replaceClubEvents(
  clubId: number,
  events: Awaited<ReturnType<typeof clusterClubTournaments>>["events"],
  signalsById: Map<number, SignalRow>,
): { events: number; sources: number } {
  const db = getDb();
  const deleteEvents = db.prepare(
    `DELETE FROM tournament_events WHERE club_id = ?`,
  );
  const insertEvent = db.prepare(`
    INSERT INTO tournament_events (
      club_id, name, category, age_groups, start_date, end_date,
      registration_date, summary, confidence
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertSource = db.prepare(`
    INSERT INTO tournament_event_sources (
      event_id, tournament_id, post_id, source, source_url
    ) VALUES (?, ?, ?, ?, ?)
  `);

  const tx = db.transaction(() => {
    deleteEvents.run(clubId);
    let eventCount = 0;
    let sourceCount = 0;
    for (const ev of events) {
      const info = insertEvent.run(
        clubId,
        ev.name,
        ev.category || null,
        ev.ageGroups || null,
        ev.startDate,
        ev.endDate,
        ev.registrationDate,
        ev.summary || null,
        ev.confidence,
      );
      const eventId = Number(info.lastInsertRowid);
      eventCount += 1;

      const seenUrls = new Set<string>();
      for (const tid of ev.tournamentIds) {
        const signal = signalsById.get(tid);
        if (!signal) continue;
        const url = signal.evidence_url || null;
        const dedupeKey = `${signal.evidence_source || ""}|${url || ""}|${tid}`;
        if (seenUrls.has(dedupeKey)) continue;
        seenUrls.add(dedupeKey);
        insertSource.run(
          eventId,
          tid,
          signal.post_id,
          signal.evidence_source,
          url,
        );
        sourceCount += 1;
      }
    }
    return { events: eventCount, sources: sourceCount };
  });

  return tx();
}

async function main() {
  const { clubFilter, dryRun } = parseArgs(process.argv.slice(2));
  const db = getDb();

  let clubs = db
    .prepare(
      `SELECT c.id, c.name, COUNT(t.id) AS signal_count
       FROM clubs c
       JOIN tournaments t ON t.club_id = c.id
       GROUP BY c.id
       ORDER BY c.name ASC`,
    )
    .all() as ClubWithTournaments[];

  if (clubFilter) {
    const needle = clubFilter.toUpperCase();
    clubs = clubs.filter(
      (c) =>
        c.name.toUpperCase().includes(needle) ||
        String(c.id) === clubFilter,
    );
  }

  console.log(
    `Clustering ${clubs.length} club(s)${dryRun ? " (dry-run)" : ""}${
      clubFilter ? ` filter=${clubFilter}` : ""
    }`,
  );

  let totalSignals = 0;
  let totalEventsBefore = 0;
  let totalEventsAfter = 0;

  for (const club of clubs) {
    const before = (
      db
        .prepare(
          `SELECT COUNT(*) AS c FROM tournament_events WHERE club_id = ?`,
        )
        .get(club.id) as { c: number }
    ).c;
    totalEventsBefore += before;

    const rows = loadSignals(club.id);
    totalSignals += rows.length;
    console.log(
      `\n${club.name} (id=${club.id}): ${rows.length} signals → clustering…`,
    );

    if (!rows.length) continue;

    const result = await clusterClubTournaments(club.name, toSignals(rows));
    console.log(
      `  AI → ${result.events.length} event(s)` +
        (before ? ` (had ${before} stored)` : ""),
    );
    for (const ev of result.events) {
      const dates =
        ev.startDate && ev.endDate && ev.startDate !== ev.endDate
          ? `${ev.startDate}–${ev.endDate}`
          : ev.startDate || "no date";
      console.log(
        `    • ${ev.name} [${dates}] ages=${ev.ageGroups || "—"} ids=${ev.tournamentIds.join(",")}`,
      );
    }

    if (dryRun) {
      totalEventsAfter += result.events.length;
      continue;
    }

    const signalsById = new Map(rows.map((r) => [r.id, r]));
    const written = replaceClubEvents(club.id, result.events, signalsById);
    totalEventsAfter += written.events;
    logScrape(
      club.id,
      "cluster",
      "ok",
      `Clustered ${rows.length} signals → ${written.events} events (${written.sources} sources)`,
    );
    console.log(
      `  wrote ${written.events} events / ${written.sources} sources`,
    );
  }

  console.log(`\nDone.`);
  console.log(`  clubs: ${clubs.length}`);
  console.log(`  signals in: ${totalSignals}`);
  console.log(`  events before: ${totalEventsBefore}`);
  console.log(`  events after: ${totalEventsAfter}`);
  if (dryRun) console.log(`  (dry-run — DB not modified)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

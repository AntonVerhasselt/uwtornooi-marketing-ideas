import { getDb, logScrape } from "../src/lib/db";
import {
  SERIES_LIST,
  getClubInfo,
  getTeamsInSeries,
  sleep,
} from "../src/lib/rbfa";

async function main() {
  const db = getDb();
  const upsert = db.prepare(`
    INSERT INTO clubs (rbfa_club_id, name, website_url, locality, series_names)
    VALUES (@rbfa_club_id, @name, @website_url, @locality, @series_names)
    ON CONFLICT(rbfa_club_id) DO UPDATE SET
      name = excluded.name,
      website_url = COALESCE(excluded.website_url, clubs.website_url),
      locality = COALESCE(excluded.locality, clubs.locality),
      series_names = CASE
        WHEN clubs.series_names IS NULL OR clubs.series_names = '' THEN excluded.series_names
        WHEN instr(clubs.series_names, excluded.series_names) > 0 THEN clubs.series_names
        ELSE clubs.series_names || ' | ' || excluded.series_names
      END
  `);

  const clubSeries = new Map<string, Set<string>>();
  const clubIds = new Set<string>();

  for (const series of SERIES_LIST) {
    process.stdout.write(`Series ${series.seriesId} (${series.name})... `);
    try {
      const teams = await getTeamsInSeries(series.seriesId);
      console.log(`${teams.length} teams`);
      logScrape(
        null,
        "rbfa_series",
        "ok",
        `${series.seriesId}: ${teams.length} teams`,
      );
      for (const t of teams) {
        clubIds.add(t.clubId);
        if (!clubSeries.has(t.clubId)) clubSeries.set(t.clubId, new Set());
        clubSeries.get(t.clubId)!.add(series.name);
      }
    } catch (e) {
      console.log("FAILED", e);
      logScrape(
        null,
        "rbfa_series",
        "error",
        `${series.seriesId}: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
    await sleep(200);
  }

  console.log(`Unique clubs: ${clubIds.size}`);
  let ok = 0;
  let fail = 0;

  for (const clubId of clubIds) {
    try {
      const info = await getClubInfo(clubId);
      if (!info) {
        fail++;
        continue;
      }
      const seriesNames = [...(clubSeries.get(clubId) || [])].join(" | ");
      upsert.run({
        rbfa_club_id: info.id,
        name: info.name,
        website_url: info.website,
        locality: info.locality,
        series_names: seriesNames,
      });
      ok++;
      if (ok % 20 === 0) console.log(`Imported ${ok}/${clubIds.size}`);
    } catch (e) {
      fail++;
      logScrape(
        null,
        "rbfa_club",
        "error",
        `${clubId}: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
    await sleep(120);
  }

  const total = (
    db.prepare(`SELECT COUNT(*) AS c FROM clubs`).get() as { c: number }
  ).c;
  console.log(`Done. ok=${ok} fail=${fail} clubs_in_db=${total}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

/**
 * Merge candidate_posts (and scrape_logs) from a scrape-rescue DB into the
 * analyze/base DB without re-analyzing existing rows.
 *
 * Match key: UNIQUE(club_id, source, source_post_id).
 * Rows only in source are inserted with analyzed=0.
 * Existing rows keep their analyzed flag and linked posts/tournaments.
 *
 * Usage:
 *   SQLITE_PATH=data/tournament-intel.db npx tsx scripts/merge-candidate-posts.ts \
 *     --from=data/scrape-rescue-finish-…/merged.db [--dry-run]
 */
import fs from "node:fs";
import path from "node:path";
import { getDb } from "../src/lib/db";

function parseArgs(argv: string[]): {
  from: string | null;
  dryRun: boolean;
} {
  let from: string | null = null;
  let dryRun = false;
  for (const arg of argv) {
    if (arg === "--dry-run") dryRun = true;
    else if (arg.startsWith("--from=")) {
      from = arg.slice("--from=".length).trim() || null;
    }
  }
  return { from, dryRun };
}

function main() {
  const { from, dryRun } = parseArgs(process.argv.slice(2));
  if (!from) {
    console.error("Usage: merge-candidate-posts.ts --from=<scrape.db> [--dry-run]");
    process.exit(1);
  }
  const fromAbs = path.resolve(from);
  if (!fs.existsSync(fromAbs)) {
    console.error(`Source DB not found: ${fromAbs}`);
    process.exit(1);
  }

  const db = getDb();
  const before = db
    .prepare(
      `SELECT
         (SELECT COUNT(*) FROM candidate_posts) AS candidates,
         (SELECT COUNT(*) FROM candidate_posts WHERE analyzed = 0) AS unanalyzed,
         (SELECT COUNT(*) FROM candidate_posts WHERE analyzed = 1) AS analyzed,
         (SELECT COUNT(*) FROM posts) AS posts,
         (SELECT COUNT(*) FROM tournaments) AS tournaments,
         (SELECT COUNT(*) FROM scrape_logs) AS scrape_logs`,
    )
    .get() as Record<string, number>;

  console.log(`Target SQLITE_PATH base counts:`, before);
  console.log(`Source: ${fromAbs}${dryRun ? " (dry-run)" : ""}`);

  db.exec(`ATTACH DATABASE '${fromAbs.replace(/'/g, "''")}' AS src`);

  // Match UNIQUE(club_id, source, source_post_id). When source_post_id is NULL
  // (SQLite allows multiple NULLs), fall back to url+text to avoid dupes.
  const notExistsSql = `
         NOT EXISTS (
           SELECT 1 FROM candidate_posts t
           WHERE t.club_id = s.club_id
             AND t.source = s.source
             AND (
               (s.source_post_id IS NOT NULL AND t.source_post_id = s.source_post_id)
               OR (
                 s.source_post_id IS NULL AND t.source_post_id IS NULL
                 AND COALESCE(t.source_url, '') = COALESCE(s.source_url, '')
                 AND t.post_text = s.post_text
               )
             )
         )`;

  const wouldInsert = (
    db
      .prepare(
        `SELECT COUNT(*) AS c
         FROM src.candidate_posts s
         WHERE ${notExistsSql}`,
      )
      .get() as { c: number }
  ).c;

  const srcTotal = (
    db.prepare(`SELECT COUNT(*) AS c FROM src.candidate_posts`).get() as {
      c: number;
    }
  ).c;

  const wouldLogs = (
    db
      .prepare(
        `SELECT COUNT(*) AS c
         FROM src.scrape_logs s
         WHERE NOT EXISTS (
           SELECT 1 FROM scrape_logs t
           WHERE t.club_id IS s.club_id
             AND t.type = s.type
             AND t.status = s.status
             AND COALESCE(t.message, '') = COALESCE(s.message, '')
             AND t.created_at = s.created_at
         )`,
      )
      .get() as { c: number }
  ).c;

  console.log(
    `Source candidates=${srcTotal}; would insert=${wouldInsert}; would insert scrape_logs≈${wouldLogs}`,
  );

  if (dryRun) {
    const sample = db
      .prepare(
        `SELECT s.id, s.club_id, s.source, s.source_post_id, substr(s.post_text,1,60) AS snippet
         FROM src.candidate_posts s
         WHERE ${notExistsSql}
         ORDER BY s.id DESC
         LIMIT 10`,
      )
      .all();
    console.log("Sample new rows (up to 10):");
    for (const row of sample) console.log(" ", row);
    db.exec(`DETACH DATABASE src`);
    console.log("Dry-run complete — no writes.");
    return;
  }

  const insertCandidates = db.prepare(
    `INSERT INTO candidate_posts (
       club_id, source, source_post_id, source_url, post_date, post_text, analyzed, created_at
     )
     SELECT
       s.club_id, s.source, s.source_post_id, s.source_url, s.post_date, s.post_text,
       0 AS analyzed,
       s.created_at
     FROM src.candidate_posts s
     WHERE ${notExistsSql}`,
  );

  const insertLogs = db.prepare(
    `INSERT INTO scrape_logs (club_id, type, status, message, created_at)
     SELECT s.club_id, s.type, s.status, s.message, s.created_at
     FROM src.scrape_logs s
     WHERE NOT EXISTS (
       SELECT 1 FROM scrape_logs t
       WHERE t.club_id IS s.club_id
         AND t.type = s.type
         AND t.status = s.status
         AND COALESCE(t.message, '') = COALESCE(s.message, '')
         AND t.created_at = s.created_at
     )`,
  );

  const tx = db.transaction(() => {
    const cand = insertCandidates.run();
    const logs = insertLogs.run();
    return { cand: cand.changes, logs: logs.changes };
  });
  const result = tx();
  db.exec(`DETACH DATABASE src`);

  const after = db
    .prepare(
      `SELECT
         (SELECT COUNT(*) FROM candidate_posts) AS candidates,
         (SELECT COUNT(*) FROM candidate_posts WHERE analyzed = 0) AS unanalyzed,
         (SELECT COUNT(*) FROM candidate_posts WHERE analyzed = 1) AS analyzed,
         (SELECT COUNT(*) FROM posts) AS posts,
         (SELECT COUNT(*) FROM tournaments) AS tournaments`,
    )
    .get() as Record<string, number>;

  console.log(`Inserted candidates=${result.cand}, scrape_logs=${result.logs}`);
  console.log(`After:`, after);
}

main();

import { analyzeAllPosts } from "../src/lib/analyze";
import { getDb, logScrape } from "../src/lib/db";

type CandidateRow = {
  id: number;
  club_id: number;
  source: string;
  source_url: string | null;
  post_date: string | null;
  post_text: string;
};

function normalizeDate(value: string): string | null {
  if (!value) return null;
  const v = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const t = Date.parse(v);
  if (!Number.isNaN(t)) return new Date(t).toISOString().slice(0, 10);
  return null;
}

async function main() {
  const limit = Number(process.env.ANALYZE_LIMIT || "0") || 0;
  const batchSize = Number(process.env.ANALYZE_BATCH || "8") || 8;
  const db = getDb();

  let rows = db
    .prepare(
      `SELECT id, club_id, source, source_url, post_date, post_text
       FROM candidate_posts
       WHERE analyzed = 0 AND length(trim(post_text)) >= 40
       ORDER BY id ASC`,
    )
    .all() as CandidateRow[];

  if (limit > 0) rows = rows.slice(0, limit);
  console.log(`Analyzing ${rows.length} candidate posts (batch=${batchSize})`);

  if (!rows.length) {
    console.log("Nothing to analyze.");
    return;
  }

  const markAnalyzed = db.prepare(
    `UPDATE candidate_posts SET analyzed = 1 WHERE id = ?`,
  );
  const insertPost = db.prepare(`
    INSERT INTO posts (club_id, candidate_post_id, facebook_post_url, post_date, post_text)
    VALUES (?, ?, ?, ?, ?)
  `);
  const insertTournament = db.prepare(`
    INSERT INTO tournaments (
      club_id, post_id, tournament_name, category, age_group,
      event_date, registration_date, summary, confidence
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Process in chunks so we persist progress even if interrupted
  const chunkSize = Math.max(batchSize * 3, 24);
  let stored = 0;

  for (let offset = 0; offset < rows.length; offset += chunkSize) {
    const chunk = rows.slice(offset, offset + chunkSize);
    console.log(
      `\nChunk ${offset + 1}-${offset + chunk.length} of ${rows.length}`,
    );

    const analyses = await analyzeAllPosts(
      chunk.map((r) => ({
        id: r.id,
        postText: r.post_text,
        postDate: r.post_date,
        source: r.source,
      })),
      {
        batchSize,
        onBatch: (done, total) => {
          console.log(`  batch progress ${done}/${total}`);
        },
      },
    );

    const tx = db.transaction(() => {
      for (const row of chunk) {
        const analysis = analyses.get(row.id);
        markAnalyzed.run(row.id);
        if (!analysis || !analysis.isTournament) continue;

        const postInfo = insertPost.run(
          row.club_id,
          row.id,
          row.source_url,
          row.post_date || normalizeDate(analysis.eventDate),
          row.post_text,
        );
        const postId = Number(postInfo.lastInsertRowid);
        insertTournament.run(
          row.club_id,
          postId,
          analysis.tournamentName || null,
          analysis.category || null,
          analysis.ageGroup || null,
          normalizeDate(analysis.eventDate),
          normalizeDate(analysis.registrationDate),
          analysis.summary || null,
          analysis.confidence,
        );
        stored++;
      }
    });
    tx();

    logScrape(
      null,
      "analyze",
      "ok",
      `chunk_offset=${offset} analyzed=${chunk.length} tournaments_so_far=${stored}`,
    );
  }

  const stats = db
    .prepare(
      `SELECT
        (SELECT COUNT(*) FROM candidate_posts WHERE analyzed = 1) AS analyzed,
        (SELECT COUNT(*) FROM posts) AS posts,
        (SELECT COUNT(*) FROM tournaments) AS tournaments`,
    )
    .get() as { analyzed: number; posts: number; tournaments: number };

  console.log(`\nDone. Newly stored tournament posts this run: ${stored}`);
  console.log("DB totals", stats);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

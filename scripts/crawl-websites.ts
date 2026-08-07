import { crawlWebsite } from "../src/lib/crawler";
import { getDb, logScrape, type ClubRow } from "../src/lib/db";

async function main() {
  const limit = Number(process.env.CRAWL_LIMIT || "0") || 0;
  const onlyMissing = process.env.CRAWL_ONLY_MISSING !== "0";
  const db = getDb();

  let clubs = db
    .prepare(
      `SELECT * FROM clubs
       WHERE website_url IS NOT NULL AND website_url != ''
       ${onlyMissing ? "AND crawled_at IS NULL" : ""}
       ORDER BY id ASC`,
    )
    .all() as ClubRow[];

  if (limit > 0) clubs = clubs.slice(0, limit);
  console.log(`Crawling ${clubs.length} club websites...`);

  const update = db.prepare(`
    UPDATE clubs
    SET facebook_url = COALESCE(?, facebook_url),
        instagram_url = COALESCE(?, instagram_url),
        crawled_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  const insertPage = db.prepare(`
    INSERT OR IGNORE INTO discovered_pages (club_id, url, page_type)
    VALUES (?, ?, ?)
  `);

  let i = 0;
  for (const club of clubs) {
    i++;
    process.stdout.write(`[${i}/${clubs.length}] ${club.name} ... `);
    try {
      const result = await crawlWebsite(club.website_url!, { maxPages: 20 });
      update.run(result.facebookUrl, result.instagramUrl, club.id);
      for (const p of result.discoveredPages) {
        insertPage.run(club.id, p.url, p.pageType);
      }
      logScrape(
        club.id,
        "crawl",
        "ok",
        `pages=${result.pagesVisited} fb=${result.facebookUrl || "-"} ig=${result.instagramUrl || "-"} discovered=${result.discoveredPages.length}`,
      );
      console.log(
        `pages=${result.pagesVisited} fb=${Boolean(result.facebookUrl)} ig=${Boolean(result.instagramUrl)}`,
      );
    } catch (e) {
      logScrape(
        club.id,
        "crawl",
        "error",
        e instanceof Error ? e.message : String(e),
      );
      console.log("ERROR", e instanceof Error ? e.message : e);
    }
  }

  const stats = db
    .prepare(
      `SELECT
        SUM(CASE WHEN crawled_at IS NOT NULL THEN 1 ELSE 0 END) AS crawled,
        SUM(CASE WHEN facebook_url IS NOT NULL AND facebook_url != '' THEN 1 ELSE 0 END) AS fb,
        SUM(CASE WHEN instagram_url IS NOT NULL AND instagram_url != '' THEN 1 ELSE 0 END) AS ig
       FROM clubs`,
    )
    .get() as { crawled: number; fb: number; ig: number };
  console.log("Crawl summary", stats);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

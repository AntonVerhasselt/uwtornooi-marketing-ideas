import { scrapeBlogPages } from "../src/lib/blog";
import { getDb, logScrape, type ClubRow } from "../src/lib/db";
import { scrapeFacebookPage } from "../src/lib/facebook";
import { scrapeInstagramProfile } from "../src/lib/instagram";
import type { ScrapedPost } from "../src/lib/scrape-types";
import {
  getAuthStatus,
  launchSocialContext,
} from "../src/lib/social-auth";
import { harvestWebsiteNews } from "../src/lib/website-news";

function insertCandidates(clubId: number, posts: ScrapedPost[]): number {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO candidate_posts
      (club_id, source, source_post_id, source_url, post_date, post_text)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  let n = 0;
  const tx = db.transaction((items: ScrapedPost[]) => {
    for (const p of items) {
      const info = stmt.run(
        clubId,
        p.source,
        p.sourcePostId,
        p.sourceUrl,
        p.postDate,
        p.postText,
      );
      n += info.changes;
    }
  });
  tx(posts);
  return n;
}

async function main() {
  const limit = Number(process.env.SCRAPE_LIMIT || "0") || 0;
  const months = Number(process.env.SCRAPE_MONTHS || "16") || 16;
  const skipFb = process.env.SKIP_FB === "1";
  const skipIg = process.env.SKIP_IG === "1";
  const skipBlog = process.env.SKIP_BLOG === "1";

  const fbAuth = getAuthStatus("facebook");
  const igAuth = getAuthStatus("instagram");
  console.log(
    `Auth: facebook=${fbAuth.loggedIn ? "logged in" : "anonymous"}` +
      `${fbAuth.accountHint ? ` (${fbAuth.accountHint})` : ""}` +
      `, instagram=${igAuth.loggedIn ? "logged in" : "anonymous"}` +
      `${igAuth.accountHint ? ` (${igAuth.accountHint})` : ""}`,
  );
  if (!fbAuth.loggedIn) {
    console.log(
      "Tip: run `npm run intel:login:facebook` then re-scrape for deeper FB history.",
    );
  }
  if (!igAuth.loggedIn) {
    console.log(
      "Tip: run `npm run intel:login:instagram` then re-scrape for deeper IG history.",
    );
  }

  const db = getDb();
  const missingOnly = process.env.SCRAPE_MISSING_ONLY === "1";
  let clubs = db
    .prepare(
      `SELECT * FROM clubs
       WHERE (facebook_url IS NOT NULL AND facebook_url != '')
          OR (instagram_url IS NOT NULL AND instagram_url != '')
          OR (website_url IS NOT NULL AND website_url != '' AND website_url != 'null')
          OR EXISTS (SELECT 1 FROM discovered_pages d WHERE d.club_id = clubs.id)
       ORDER BY id ASC`,
    )
    .all() as ClubRow[];

  if (missingOnly) {
    clubs = clubs.filter((club) => {
      const row = db
        .prepare(
          `SELECT COUNT(*) AS c FROM candidate_posts WHERE club_id = ?`,
        )
        .get(club.id) as { c: number };
      return row.c === 0;
    });
    console.log(
      `SCRAPE_MISSING_ONLY=1 → ${clubs.length} club(s) with zero candidate_posts`,
    );
  }

  if (limit > 0) clubs = clubs.slice(0, limit);
  console.log(`Scraping social/blog for ${clubs.length} clubs (months=${months})`);

  const fbCtx = !skipFb
    ? await launchSocialContext("facebook", { headless: true })
    : null;
  const igCtx = !skipIg
    ? await launchSocialContext("instagram", { headless: true })
    : null;

  try {
    let i = 0;
    for (const club of clubs) {
      i++;
      console.log(`\n[${i}/${clubs.length}] ${club.name}`);

      if (!skipFb && club.facebook_url && fbCtx) {
        try {
          const posts = await scrapeFacebookPage(fbCtx.context, club.facebook_url, {
            months,
            authenticated: fbCtx.usingAuth,
          });
          const inserted = insertCandidates(club.id, posts);
          logScrape(
            club.id,
            "facebook",
            "ok",
            `auth=${fbCtx.usingAuth} scraped=${posts.length} inserted=${inserted}`,
          );
          console.log(
            `  facebook${fbCtx.usingAuth ? " (auth)" : ""}: scraped=${posts.length} inserted=${inserted}`,
          );
        } catch (e) {
          logScrape(
            club.id,
            "facebook",
            "error",
            e instanceof Error ? e.message : String(e),
          );
          console.log("  facebook ERROR", e instanceof Error ? e.message : e);
        }
      }

      if (!skipIg && club.instagram_url && igCtx) {
        try {
          const posts = await scrapeInstagramProfile(
            igCtx.context,
            club.instagram_url,
            { months, authenticated: igCtx.usingAuth },
          );
          const inserted = insertCandidates(club.id, posts);
          logScrape(
            club.id,
            "instagram",
            "ok",
            `auth=${igCtx.usingAuth} scraped=${posts.length} inserted=${inserted}`,
          );
          console.log(
            `  instagram${igCtx.usingAuth ? " (auth)" : ""}: scraped=${posts.length} inserted=${inserted}`,
          );
        } catch (e) {
          logScrape(
            club.id,
            "instagram",
            "error",
            e instanceof Error ? e.message : String(e),
          );
          console.log("  instagram ERROR", e instanceof Error ? e.message : e);
        }
      }

      if (!skipBlog) {
        const pages = db
          .prepare(
            `SELECT url, page_type AS pageType FROM discovered_pages WHERE club_id = ?`,
          )
          .all(club.id) as Array<{ url: string; pageType: string }>;
        try {
          const fromPages = pages.length
            ? await scrapeBlogPages(pages, { months, maxPages: 15 })
            : [];
          const fromSite = club.website_url
            ? await harvestWebsiteNews(club.website_url, {
                months,
                maxPages: 20,
              })
            : [];
          const posts = [...fromPages, ...fromSite];
          const inserted = insertCandidates(club.id, posts);
          logScrape(
            club.id,
            "blog",
            "ok",
            `scraped=${posts.length} inserted=${inserted}`,
          );
          console.log(`  blog: scraped=${posts.length} inserted=${inserted}`);
        } catch (e) {
          logScrape(
            club.id,
            "blog",
            "error",
            e instanceof Error ? e.message : String(e),
          );
          console.log("  blog ERROR", e instanceof Error ? e.message : e);
        }
      }
    }
  } finally {
    await fbCtx?.context.close().catch(() => undefined);
    await igCtx?.context.close().catch(() => undefined);
  }

  const count = (
    db.prepare(`SELECT COUNT(*) AS c FROM candidate_posts`).get() as {
      c: number;
    }
  ).c;
  console.log(`\nCandidate posts in DB: ${count}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

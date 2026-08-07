/**
 * Playwright fallback for club websites where static HTML had no social links.
 */
import { chromium } from "playwright";
import * as cheerio from "cheerio";
import { getDb, logScrape, type ClubRow } from "../src/lib/db";

function cleanFacebook(url: string): string | null {
  try {
    const u = new URL(url);
    if (!/facebook\.com|fb\.com/i.test(u.hostname)) return null;
    u.search = "";
    u.hash = "";
    u.hostname = "www.facebook.com";
    if (!u.pathname || u.pathname === "/") return null;
    return u.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

function cleanInstagram(url: string): string | null {
  try {
    const u = new URL(url);
    if (!/instagram\.com/i.test(u.hostname)) return null;
    u.search = "";
    u.hash = "";
    u.hostname = "www.instagram.com";
    if (!u.pathname || u.pathname === "/") return null;
    return u.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

async function main() {
  const db = getDb();
  const clubs = db
    .prepare(
      `SELECT * FROM clubs
       WHERE website_url IS NOT NULL AND website_url != ''
         AND (facebook_url IS NULL OR facebook_url = '')
       ORDER BY id ASC`,
    )
    .all() as ClubRow[];

  console.log(`JS fallback crawl for ${clubs.length} clubs without Facebook`);
  const browser = await chromium.launch({ headless: true });
  const update = db.prepare(
    `UPDATE clubs SET facebook_url = COALESCE(?, facebook_url),
                       instagram_url = COALESCE(?, instagram_url)
     WHERE id = ?`,
  );

  try {
    let i = 0;
    for (const club of clubs) {
      i++;
      process.stdout.write(`[${i}/${clubs.length}] ${club.name} ... `);
      const page = await browser.newPage();
      try {
        const website = (club.website_url || "").trim();
        if (!website || website === "null" || !/^https?:\/\//i.test(website)) {
          console.log("skip bad url");
          continue;
        }
        await page.goto(website, {
          waitUntil: "domcontentloaded",
          timeout: 25000,
        });
        await page.waitForTimeout(2500);
        // follow iframe shells
        const iframeCount = await page.locator("iframe[src]").count();
        if (iframeCount > 0) {
          const iframe = await page.locator("iframe[src]").first().getAttribute("src");
          if (iframe && (await page.locator("a[href]").count()) < 3) {
            await page.goto(iframe, {
              waitUntil: "domcontentloaded",
              timeout: 25000,
            });
            await page.waitForTimeout(2000);
          }
        }
        const html = await page.content();
        const $ = cheerio.load(html);
        const hrefs = new Set<string>();
        $("a[href]").each((_, el) => {
          const h = $(el).attr("href");
          if (h) hrefs.add(h);
        });
        for (const m of html.matchAll(
          /https?:\/\/(?:www\.)?(?:facebook|fb|instagram)\.com\/[A-Za-z0-9._\-\/%?=&#]+/gi,
        )) {
          hrefs.add(m[0].replace(/&amp;/g, "&"));
        }
        let fb: string | null = null;
        let ig: string | null = null;
        for (const h of hrefs) {
          fb = fb || cleanFacebook(h.startsWith("//") ? `https:${h}` : h);
          ig = ig || cleanInstagram(h.startsWith("//") ? `https:${h}` : h);
        }
        if (fb || ig) {
          update.run(fb, ig, club.id);
          logScrape(club.id, "crawl_js", "ok", `fb=${fb || "-"} ig=${ig || "-"}`);
          console.log(`fb=${Boolean(fb)} ig=${Boolean(ig)}`);
        } else {
          console.log("none");
        }
      } catch (e) {
        console.log("err", e instanceof Error ? e.message : e);
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }

  console.log(
    db
      .prepare(
        `SELECT
          SUM(CASE WHEN facebook_url IS NOT NULL AND facebook_url != '' THEN 1 ELSE 0 END) AS fb,
          SUM(CASE WHEN instagram_url IS NOT NULL AND instagram_url != '' THEN 1 ELSE 0 END) AS ig
         FROM clubs`,
      )
      .get(),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

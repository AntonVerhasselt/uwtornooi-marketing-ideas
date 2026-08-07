import * as cheerio from "cheerio";
import { isWithinMonths, type ScrapedPost } from "./scrape-types";

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36";

const TOURNAMENTISH =
  /tornooi|toernooi|tournament|cup|jeugdtornooi|inschrijven|registratie/i;

function hashText(text: string): string {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h.toString(16);
}

function extractDate(html: string, $: cheerio.CheerioAPI): string | null {
  const time = $("time[datetime]").first().attr("datetime");
  if (time && !Number.isNaN(Date.parse(time))) {
    return new Date(time).toISOString().slice(0, 10);
  }
  const meta =
    $('meta[property="article:published_time"]').attr("content") ||
    $('meta[name="date"]').attr("content");
  if (meta && !Number.isNaN(Date.parse(meta))) {
    return new Date(meta).toISOString().slice(0, 10);
  }
  const m = html.match(
    /\b(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})\b|\b(\d{1,2})[-/.](\d{1,2})[-/.](20\d{2})\b/,
  );
  if (m) {
    if (m[1]) {
      return `${m[1]}-${m[2]!.padStart(2, "0")}-${m[3]!.padStart(2, "0")}`;
    }
    return `${m[6]}-${m[5]!.padStart(2, "0")}-${m[4]!.padStart(2, "0")}`;
  }
  return null;
}

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "user-agent": USER_AGENT, accept: "text/html,*/*" },
      redirect: "follow",
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

export async function scrapeBlogPages(
  pages: Array<{ url: string; pageType: string }>,
  options?: { months?: number; maxPages?: number },
): Promise<ScrapedPost[]> {
  const months = options?.months ?? 16;
  const maxPages = options?.maxPages ?? 20;
  const posts: ScrapedPost[] = [];
  const seen = new Set<string>();

  const prioritized = [...pages].sort((a, b) => {
    const score = (p: { url: string; pageType: string }) =>
      (p.pageType === "tournament" ? 0 : p.pageType === "blog" ? 1 : 2) +
      (TOURNAMENTISH.test(p.url) ? -1 : 0);
    return score(a) - score(b);
  });

  for (const page of prioritized.slice(0, maxPages)) {
    const html = await fetchHtml(page.url);
    if (!html) continue;
    const $ = cheerio.load(html);
    $("script, style, noscript").remove();

    const title = $("h1").first().text().trim() || $("title").text().trim();
    const articleText = (
      $("article").text() ||
      $("main").text() ||
      $("body").text()
    )
      .replace(/\s+/g, " ")
      .trim();

    if (articleText.length < 80) continue;

    // Prefer pages that look tournament-related or are news/blog
    const hay = `${title}\n${articleText.slice(0, 2000)}`;
    if (
      page.pageType !== "tournament" &&
      page.pageType !== "blog" &&
      !TOURNAMENTISH.test(hay)
    ) {
      continue;
    }

    const text = `${title ? title + "\n\n" : ""}${articleText}`.slice(0, 4000);
    const postDate = extractDate(html, $);
    if (!isWithinMonths(postDate, months) && postDate) continue;

    const id = `blog:${hashText(page.url)}`;
    if (seen.has(id)) continue;
    seen.add(id);

    posts.push({
      source: "blog",
      sourcePostId: id,
      sourceUrl: page.url,
      postDate,
      postText: text,
    });
  }

  return posts;
}

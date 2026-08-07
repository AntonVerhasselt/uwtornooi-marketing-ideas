import * as cheerio from "cheerio";
import { isWithinMonths, type ScrapedPost } from "./scrape-types";

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36";

const KEYWORDS =
  /tornooi|toernooi|tournament|jeugdtornooi|inschrijven|registratie|\bcup\b|pasen|pinkster|zomer/i;

function hashText(text: string): string {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h.toString(16);
}

async function fetchHtml(url: string): Promise<{ html: string; finalUrl: string } | null> {
  try {
    const res = await fetch(url, {
      headers: { "user-agent": USER_AGENT, accept: "text/html,*/*" },
      redirect: "follow",
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return null;
    return { html: await res.text(), finalUrl: res.url };
  } catch {
    return null;
  }
}

function sameHost(a: string, b: string): boolean {
  try {
    return (
      new URL(a).hostname.replace(/^www\./, "") ===
      new URL(b).hostname.replace(/^www\./, "")
    );
  } catch {
    return false;
  }
}

function extractArticle(html: string, url: string): ScrapedPost | null {
  const $ = cheerio.load(html);
  $("script, style, noscript, nav, footer, header").remove();
  const title = ($("h1").first().text() || $("title").text()).trim();
  const text = ($("article").text() || $("main").text() || $("body").text())
    .replace(/\s+/g, " ")
    .trim();
  if (text.length < 80) return null;
  const combined = `${title}\n\n${text}`.slice(0, 4000);
  if (!KEYWORDS.test(combined) && !KEYWORDS.test(url)) return null;

  let postDate: string | null = null;
  const dt = $("time[datetime]").attr("datetime");
  if (dt && !Number.isNaN(Date.parse(dt))) {
    postDate = new Date(dt).toISOString().slice(0, 10);
  }

  return {
    source: "blog",
    sourcePostId: `web:${hashText(url)}`,
    sourceUrl: url,
    postDate,
    postText: combined,
  };
}

/** Discover news/tournament-like pages from a club homepage and extract content. */
export async function harvestWebsiteNews(
  websiteUrl: string,
  options?: { months?: number; maxPages?: number },
): Promise<ScrapedPost[]> {
  const months = options?.months ?? 16;
  const maxPages = options?.maxPages ?? 25;
  const seed = websiteUrl.trim();
  if (!/^https?:\/\//i.test(seed)) return [];

  const home = await fetchHtml(seed);
  if (!home) return [];

  // Follow iframe shell
  let baseHtml = home.html;
  let baseUrl = home.finalUrl;
  const $home = cheerio.load(baseHtml);
  const iframe = $home("iframe[src]").attr("src");
  if (iframe && $home("a[href]").length < 3) {
    const nested = await fetchHtml(new URL(iframe, baseUrl).toString());
    if (nested) {
      baseHtml = nested.html;
      baseUrl = nested.finalUrl;
    }
  }

  const $ = cheerio.load(baseHtml);
  const candidates = new Set<string>();
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    try {
      const abs = new URL(href, baseUrl).toString();
      if (!sameHost(abs, baseUrl)) return;
      const label = `${href} ${$(el).text()}`;
      if (
        KEYWORDS.test(label) ||
        /nieuws|news|blog|actua|bericht|agenda|tornooi|toernooi|cup/i.test(label)
      ) {
        candidates.add(abs.split("#")[0]!);
      }
    } catch {
      /* ignore */
    }
  });

  // Also scan raw HTML for keyword URLs
  for (const m of baseHtml.matchAll(/href=["']([^"']+)["']/gi)) {
    const href = m[1]!;
    if (!KEYWORDS.test(href) && !/nieuws|news|blog/i.test(href)) continue;
    try {
      const abs = new URL(href, baseUrl).toString();
      if (sameHost(abs, baseUrl)) candidates.add(abs.split("#")[0]!);
    } catch {
      /* ignore */
    }
  }

  const posts: ScrapedPost[] = [];
  const seen = new Set<string>();

  for (const url of [...candidates].slice(0, maxPages)) {
    const page = await fetchHtml(url);
    if (!page) continue;
    // If this looks like a listing, collect child links
    const $p = cheerio.load(page.html);
    const childLinks: string[] = [];
    $p("a[href]").each((_, el) => {
      const href = $p(el).attr("href");
      if (!href) return;
      try {
        const abs = new URL(href, page.finalUrl).toString().split("#")[0]!;
        if (!sameHost(abs, baseUrl)) return;
        const label = `${href} ${$p(el).text()}`;
        if (KEYWORDS.test(label) || /nieuws|news|20\d{2}/i.test(label)) {
          childLinks.push(abs);
        }
      } catch {
        /* ignore */
      }
    });

    for (const child of [url, ...childLinks.slice(0, 10)]) {
      if (seen.has(child)) continue;
      seen.add(child);
      const html =
        child === url ? page.html : (await fetchHtml(child))?.html;
      if (!html) continue;
      const post = extractArticle(html, child);
      if (!post) continue;
      if (post.postDate && !isWithinMonths(post.postDate, months)) continue;
      posts.push(post);
      if (posts.length >= maxPages) return posts;
    }
  }

  return posts;
}

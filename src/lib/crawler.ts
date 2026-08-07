import * as cheerio from "cheerio";

const TOURNAMENT_KEYWORDS = [
  "tornooi",
  "toernooi",
  "tournament",
  "cup",
  "jeugdtornooi",
  "inschrijven",
  "registratie",
];

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36";

export type CrawlResult = {
  facebookUrl: string | null;
  instagramUrl: string | null;
  discoveredPages: Array<{ url: string; pageType: string }>;
  pagesVisited: number;
};

function normalizeUrl(href: string, base: string): string | null {
  try {
    const u = new URL(href, base);
    if (!/^https?:$/i.test(u.protocol)) return null;
    u.hash = "";
    return u.toString();
  } catch {
    return null;
  }
}

function sameHost(a: string, b: string): boolean {
  try {
    return new URL(a).hostname.replace(/^www\./, "") ===
      new URL(b).hostname.replace(/^www\./, "");
  } catch {
    return false;
  }
}

function cleanSocialUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    if (host === "facebook.com" || host === "fb.com" || host === "m.facebook.com") {
      // drop tracking params
      u.search = "";
      u.hash = "";
      u.hostname = "www.facebook.com";
      const path = u.pathname.replace(/\/$/, "");
      if (!path || path === "/" || path.startsWith("/sharer")) return null;
      return u.toString();
    }
    if (host === "instagram.com") {
      u.search = "";
      u.hash = "";
      u.hostname = "www.instagram.com";
      const path = u.pathname.replace(/\/$/, "");
      if (!path || path === "/") return null;
      return u.toString();
    }
    return null;
  } catch {
    return null;
  }
}

function extractUrlsFromHtml(html: string, baseUrl: string): string[] {
  const $ = cheerio.load(html);
  const out = new Set<string>();

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    const n = normalizeUrl(href, baseUrl);
    if (n) out.add(n);
  });

  // iframe redirect shells (common for Belgian club sites)
  $("iframe[src]").each((_, el) => {
    const src = $(el).attr("src");
    if (!src) return;
    const n = normalizeUrl(src, baseUrl);
    if (n) out.add(n);
  });

  for (const m of html.matchAll(
    /https?:\/\/(?:www\.)?(?:m\.)?(?:facebook|fb|instagram)\.com\/[A-Za-z0-9._\-\/%?=&#]+/gi,
  )) {
    out.add(m[0].replace(/&amp;/g, "&"));
  }
  for (const m of html.matchAll(
    /\/\/(?:www\.)?(?:m\.)?(?:facebook|fb|instagram)\.com\/[A-Za-z0-9._\-\/%?=&#]+/gi,
  )) {
    out.add(`https:${m[0]}`.replace(/&amp;/g, "&"));
  }

  return [...out];
}

function pageTypeFor(url: string): string {
  const lower = url.toLowerCase();
  if (TOURNAMENT_KEYWORDS.some((k) => lower.includes(k))) return "tournament";
  if (/nieuws|news|blog|actua|bericht/.test(lower)) return "blog";
  if (/contact|secretariaat/.test(lower)) return "contact";
  return "page";
}

async function fetchHtml(url: string): Promise<{ html: string; finalUrl: string } | null> {
  try {
    const res = await fetch(url, {
      headers: { "user-agent": USER_AGENT, accept: "text/html,*/*" },
      redirect: "follow",
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "";
    if (ct && !/html|text|xml/i.test(ct)) return null;
    const html = await res.text();
    return { html, finalUrl: res.url };
  } catch {
    return null;
  }
}

export async function crawlWebsite(
  startUrl: string,
  options?: { maxPages?: number },
): Promise<CrawlResult> {
  const maxPages = options?.maxPages ?? 50;
  const seed = normalizeUrl(startUrl, startUrl);
  if (!seed) {
    return {
      facebookUrl: null,
      instagramUrl: null,
      discoveredPages: [],
      pagesVisited: 0,
    };
  }

  const queue: string[] = [seed];
  const visited = new Set<string>();
  let facebookUrl: string | null = null;
  let instagramUrl: string | null = null;
  const discoveredPages: Array<{ url: string; pageType: string }> = [];
  let originHost = "";

  while (queue.length && visited.size < maxPages) {
    // Early exit once we have social + some discovery signal
    if (facebookUrl && visited.size >= 8) break;

    const url = queue.shift()!;
    const key = url.replace(/\/$/, "").toLowerCase();
    if (visited.has(key)) continue;
    visited.add(key);

    const fetched = await fetchHtml(url);
    if (!fetched) continue;
    if (!originHost) {
      originHost = new URL(fetched.finalUrl).hostname.replace(/^www\./, "");
    }

    // Follow pure iframe shells immediately
    const iframeOnly = cheerio.load(fetched.html)("iframe[src]").attr("src");
    const linkCount = cheerio.load(fetched.html)("a[href]").length;
    if (iframeOnly && linkCount < 3) {
      const iframeUrl = normalizeUrl(iframeOnly, fetched.finalUrl);
      if (iframeUrl && !visited.has(iframeUrl.replace(/\/$/, "").toLowerCase())) {
        queue.unshift(iframeUrl);
      }
    }

    const urls = extractUrlsFromHtml(fetched.html, fetched.finalUrl);
    for (const u of urls) {
      const social = cleanSocialUrl(u);
      if (social) {
        if (/facebook\.com|fb\.com/i.test(social) && !facebookUrl) {
          facebookUrl = social;
        }
        if (/instagram\.com/i.test(social) && !instagramUrl) {
          instagramUrl = social;
        }
        continue;
      }

      if (!sameHost(u, fetched.finalUrl) && !sameHost(u, seed)) continue;
      // stay on resolved host
      try {
        const host = new URL(u).hostname.replace(/^www\./, "");
        if (originHost && host !== originHost) continue;
      } catch {
        continue;
      }

      const type = pageTypeFor(u);
      if (type === "tournament" || type === "blog" || type === "contact") {
        if (!discoveredPages.some((p) => p.url === u)) {
          discoveredPages.push({ url: u, pageType: type });
        }
      }

      const qKey = u.replace(/\/$/, "").toLowerCase();
      if (!visited.has(qKey) && queue.length + visited.size < maxPages * 2) {
        // Prefer tournament/blog/contact pages
        if (type === "tournament" || type === "blog" || type === "contact") {
          queue.unshift(u);
        } else if (visited.size < 12) {
          queue.push(u);
        }
      }
    }
  }

  return {
    facebookUrl,
    instagramUrl,
    discoveredPages,
    pagesVisited: visited.size,
  };
}

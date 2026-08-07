import type { BrowserContext, Page } from "playwright";
import {
  decodeJsString,
  isWithinMonths,
  monthsAgoIsoDate,
  type ScrapedPost,
} from "./scrape-types";

function usernameFromUrl(instagramUrl: string): string | null {
  try {
    const u = new URL(instagramUrl);
    const parts = u.pathname.split("/").filter(Boolean);
    const skip = new Set(["p", "reel", "reels", "stories", "explore"]);
    const name = parts.find((p) => !skip.has(p.toLowerCase()));
    return name || null;
  } catch {
    return null;
  }
}

function hashText(text: string): string {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h.toString(16);
}

async function dismissCookies(page: Page): Promise<void> {
  const labels = [
    /Decline optional cookies/i,
    /Allow all cookies/i,
    /Alle cookies toestaan/i,
    /Only allow essential cookies/i,
    /Accept/i,
  ];
  for (const label of labels) {
    const btn = page.getByRole("button", { name: label });
    if ((await btn.count()) > 0) {
      await btn.first().click({ timeout: 2000 }).catch(() => undefined);
      await page.waitForTimeout(800);
      return;
    }
  }
}

function parseFromHtml(html: string, username: string): ScrapedPost[] {
  const posts: ScrapedPost[] = [];
  const seen = new Set<string>();

  const shortcodes = [
    ...html.matchAll(/"shortcode"\s*:\s*"([A-Za-z0-9_-]+)"/g),
  ].map((m) => m[1]!);
  const takenAts = [...html.matchAll(/"taken_at(?:_timestamp)?"\s*:\s*(\d+)/g)].map(
    (m) => Number(m[1]),
  );

  const captionRe = /"caption"\s*:\s*"((?:\\.|[^"\\])*)"/g;
  const captions: string[] = [];
  for (const m of html.matchAll(captionRe)) {
    const text = decodeJsString(m[1] || "").trim();
    if (text.length >= 20) captions.push(text);
  }

  // Also edge media text nodes near shortcodes
  const edgeTextRe =
    /"text"\s*:\s*"((?:\\.|[^"\\])*)"/g;
  for (const m of html.matchAll(edgeTextRe)) {
    const text = decodeJsString(m[1] || "").trim();
    if (text.length < 40) continue;
    if (/^(Follow|Following|Like|Comment|Share|Log in)/i.test(text)) continue;
    captions.push(text);
  }

  const uniqueCaptions = [...new Set(captions)];
  for (let i = 0; i < uniqueCaptions.length; i++) {
    const text = uniqueCaptions[i]!;
    const sc = shortcodes[i];
    const ts = takenAts[i];
    const id = sc ? `ig:${sc}` : `ig-caption:${username}:${hashText(text)}`;
    if (seen.has(id)) continue;
    seen.add(id);
    posts.push({
      source: "instagram",
      sourcePostId: id,
      sourceUrl: sc ? `https://www.instagram.com/p/${sc}/` : null,
      postDate: ts ? new Date(ts * 1000).toISOString().slice(0, 10) : null,
      postText: text,
    });
  }

  return posts;
}

function mergePosts(into: ScrapedPost[], more: ScrapedPost[]): void {
  const seen = new Set(into.map((p) => p.sourcePostId));
  for (const p of more) {
    if (seen.has(p.sourcePostId)) continue;
    seen.add(p.sourcePostId);
    into.push(p);
  }
}

export async function scrapeInstagramProfile(
  context: BrowserContext,
  instagramUrl: string,
  options?: {
    months?: number;
    maxPosts?: number;
    maxScrolls?: number;
    authenticated?: boolean;
  },
): Promise<ScrapedPost[]> {
  const months = options?.months ?? 16;
  const authenticated = Boolean(options?.authenticated);
  const maxPosts = options?.maxPosts ?? (authenticated ? 150 : 30);
  const maxScrolls = options?.maxScrolls ?? (authenticated ? 60 : 6);
  const cutoff = monthsAgoIsoDate(months);
  const username = usernameFromUrl(instagramUrl);
  if (!username) return [];

  const page = await context.newPage();
  const collected: ScrapedPost[] = [];
  const networkChunks: string[] = [];

  page.on("response", async (res) => {
    try {
      const url = res.url();
      if (!/instagram\.com|graphql/i.test(url)) return;
      const ct = res.headers()["content-type"] || "";
      if (!/json|javascript|text/i.test(ct)) return;
      const text = await res.text();
      if (/shortcode|caption|taken_at/i.test(text)) {
        networkChunks.push(text);
        mergePosts(collected, parseFromHtml(text, username));
      }
    } catch {
      /* ignore */
    }
  });

  try {
    await page.goto(`https://www.instagram.com/${username}/`, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await page.waitForTimeout(2500);
    await dismissCookies(page);

    let stagnant = 0;
    let lastCount = 0;

    for (let i = 0; i < maxScrolls; i++) {
      await page.mouse.wheel(0, 2400);
      await page.waitForTimeout(authenticated ? 1100 : 900);

      if (i % 2 === 0) {
        mergePosts(collected, parseFromHtml(await page.content(), username));
      }

      const inWindow = collected.filter((p) => isWithinMonths(p.postDate, months));
      if (inWindow.length >= maxPosts) break;

      const dated = collected
        .map((p) => p.postDate)
        .filter((d): d is string => Boolean(d))
        .sort();
      if (dated[0] && dated[0] < cutoff && inWindow.length > 5) break;

      if (collected.length === lastCount) {
        stagnant++;
        if (stagnant >= (authenticated ? 10 : 3)) break;
      } else {
        stagnant = 0;
        lastCount = collected.length;
      }
    }

    mergePosts(
      collected,
      parseFromHtml([await page.content(), ...networkChunks].join("\n"), username),
    );

    let posts = collected.filter((p) => isWithinMonths(p.postDate, months));

    if (posts.length === 0) {
      const dom = await page.evaluate(() => {
        const out: string[] = [];
        for (const n of document.querySelectorAll("article li, ul li, span")) {
          const t = ((n as HTMLElement).innerText || "")
            .replace(/\s+/g, " ")
            .trim();
          if (t.length > 60 && t.length < 2200) out.push(t);
        }
        return [...new Set(out)].slice(0, 20);
      });
      posts = dom.map((text, i) => ({
        source: "instagram" as const,
        sourcePostId: `ig-dom:${username}:${i}:${hashText(text)}`,
        sourceUrl: null,
        postDate: null,
        postText: text,
      }));
    }

    return posts.slice(0, maxPosts);
  } finally {
    await page.close().catch(() => undefined);
  }
}

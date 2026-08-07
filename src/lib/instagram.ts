import type { Browser, Page } from "playwright";
import {
  decodeJsString,
  isWithinMonths,
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

  // caption text patterns in embedded JSON
  const captionRe =
    /"caption"\s*:\s*"((?:\\.|[^"\\])*)"/g;
  for (const m of html.matchAll(captionRe)) {
    const text = decodeJsString(m[1] || "").trim();
    if (text.length < 20) continue;
    const id = `ig-caption:${username}:${hashText(text)}`;
    if (seen.has(id)) continue;
    seen.add(id);
    posts.push({
      source: "instagram",
      sourcePostId: id,
      sourceUrl: null,
      postDate: null,
      postText: text,
    });
  }

  // edge media captions
  const edgeRe =
    /"text"\s*:\s*"((?:\\.|[^"\\])*)"/g;
  for (const m of html.matchAll(edgeRe)) {
    const text = decodeJsString(m[1] || "").trim();
    if (text.length < 40) continue;
    // skip UI chrome
    if (/^(Follow|Following|Like|Comment|Share|Log in)/i.test(text)) continue;
    const id = `ig-text:${username}:${hashText(text)}`;
    if (seen.has(id)) continue;
    seen.add(id);
    posts.push({
      source: "instagram",
      sourcePostId: id,
      sourceUrl: null,
      postDate: null,
      postText: text,
    });
  }

  // shortcode + taken_at
  const shortcodes = [
    ...html.matchAll(/"shortcode"\s*:\s*"([A-Za-z0-9_-]+)"/g),
  ].map((m) => m[1]!);
  const takenAts = [...html.matchAll(/"taken_at"\s*:\s*(\d+)/g)].map((m) =>
    Number(m[1]),
  );

  for (let i = 0; i < Math.min(shortcodes.length, posts.length); i++) {
    const sc = shortcodes[i]!;
    posts[i]!.sourceUrl = `https://www.instagram.com/p/${sc}/`;
    posts[i]!.sourcePostId = `ig:${sc}`;
    if (takenAts[i]) {
      posts[i]!.postDate = new Date(takenAts[i]! * 1000)
        .toISOString()
        .slice(0, 10);
    }
  }

  return posts;
}

function hashText(text: string): string {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h.toString(16);
}

export async function scrapeInstagramProfile(
  browser: Browser,
  instagramUrl: string,
  options?: { months?: number; maxPosts?: number },
): Promise<ScrapedPost[]> {
  const months = options?.months ?? 16;
  const maxPosts = options?.maxPosts ?? 30;
  const username = usernameFromUrl(instagramUrl);
  if (!username) return [];

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36",
    locale: "nl-BE",
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  try {
    await page.goto(`https://www.instagram.com/${username}/`, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await page.waitForTimeout(2500);
    await dismissCookies(page);

    for (let i = 0; i < 6; i++) {
      await page.mouse.wheel(0, 2200);
      await page.waitForTimeout(1000);
    }

    const html = await page.content();
    let posts = parseFromHtml(html, username).filter((p) =>
      isWithinMonths(p.postDate, months),
    );

    if (posts.length === 0) {
      // DOM fallback: article/figcaption text
      const dom = await page.evaluate(() => {
        const out: string[] = [];
        for (const n of document.querySelectorAll("article, li, span")) {
          const t = ((n as HTMLElement).innerText || "").replace(/\s+/g, " ").trim();
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
    await context.close();
  }
}

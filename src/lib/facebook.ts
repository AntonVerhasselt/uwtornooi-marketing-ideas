import type { BrowserContext, Page } from "playwright";
import {
  decodeJsString,
  isWithinMonths,
  monthsAgoIsoDate,
  type ScrapedPost,
} from "./scrape-types";

function pagePath(facebookUrl: string): string {
  const u = new URL(facebookUrl);
  const parts = u.pathname.split("/").filter(Boolean);
  if (parts[0] === "profile.php") {
    return `profile.php?id=${u.searchParams.get("id") || ""}`;
  }
  return parts[0] || "";
}

function hashText(text: string): string {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h.toString(16);
}

function parsePostsFromHtml(html: string, pageSlug: string): ScrapedPost[] {
  const posts: ScrapedPost[] = [];
  const seen = new Set<string>();

  const messageRe =
    /"message"\s*:\s*\{\s*"text"\s*:\s*"((?:\\.|[^"\\])*)"/g;
  const messages: Array<{ text: string; index: number }> = [];
  for (const m of html.matchAll(messageRe)) {
    const text = decodeJsString(m[1] || "").trim();
    if (text.length < 20) continue;
    messages.push({ text, index: m.index ?? 0 });
  }

  const timeRe = /"creation_time"\s*:\s*(\d+)/g;
  const times: Array<{ ts: number; index: number }> = [];
  for (const m of html.matchAll(timeRe)) {
    times.push({ ts: Number(m[1]), index: m.index ?? 0 });
  }

  const urlRe =
    /https:\/\/www\.facebook\.com\/[^"'\s]+\/(?:posts|videos|reel)\/[A-Za-z0-9]+/g;
  const urls = [...html.matchAll(urlRe)].map((m) =>
    m[0].replace(/\\u002F/g, "/").split("&")[0]!,
  );

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i]!;
    let bestTime: number | null = null;
    let bestDist = Infinity;
    for (const t of times) {
      const dist = Math.abs(t.index - msg.index);
      if (dist < bestDist && dist < 8000) {
        bestDist = dist;
        bestTime = t.ts;
      }
    }
    const postDate = bestTime
      ? new Date(bestTime * 1000).toISOString().slice(0, 10)
      : null;
    const sourcePostId = `fb:${pageSlug}:${bestTime || i}:${hashText(msg.text)}`;
    if (seen.has(sourcePostId)) continue;
    seen.add(sourcePostId);

    const nearbyUrl =
      urls.find((u) => u.toLowerCase().includes(pageSlug.toLowerCase())) ||
      urls[i] ||
      null;

    posts.push({
      source: "facebook",
      sourcePostId,
      sourceUrl: nearbyUrl,
      postDate,
      postText: msg.text,
    });
  }

  return posts;
}

async function dismissCookies(page: Page): Promise<void> {
  const labels = [
    /Decline optional cookies/i,
    /Alle cookies weigeren/i,
    /Only allow essential cookies/i,
    /Allow all cookies/i,
    /Accept all/i,
    /Decline/i,
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

function mergePosts(into: ScrapedPost[], more: ScrapedPost[]): void {
  const seen = new Set(into.map((p) => p.sourcePostId));
  for (const p of more) {
    if (seen.has(p.sourcePostId)) continue;
    seen.add(p.sourcePostId);
    into.push(p);
  }
}

function oldestDated(posts: ScrapedPost[]): string | null {
  const dates = posts
    .map((p) => p.postDate)
    .filter((d): d is string => Boolean(d))
    .sort();
  return dates[0] || null;
}

export async function scrapeFacebookPage(
  context: BrowserContext,
  facebookUrl: string,
  options?: {
    months?: number;
    maxScrolls?: number;
    maxPosts?: number;
    authenticated?: boolean;
  },
): Promise<ScrapedPost[]> {
  const months = options?.months ?? 16;
  const authenticated = Boolean(options?.authenticated);
  const maxScrolls =
    options?.maxScrolls ?? (authenticated ? 80 : 5);
  const maxPosts = options?.maxPosts ?? (authenticated ? 200 : 40);
  const cutoff = monthsAgoIsoDate(months);

  const slug = pagePath(facebookUrl);
  if (!slug) return [];

  const page = await context.newPage();
  const networkHtmlChunks: string[] = [];
  const collected: ScrapedPost[] = [];

  page.on("response", async (res) => {
    try {
      const ct = res.headers()["content-type"] || "";
      if (!/json|javascript|html|text/i.test(ct)) return;
      const text = await res.text();
      if (/"creation_time"/.test(text) && /"message"/.test(text)) {
        networkHtmlChunks.push(text);
        mergePosts(collected, parsePostsFromHtml(text, slug));
      }
    } catch {
      /* ignore */
    }
  });

  try {
    const target = facebookUrl.includes("profile.php")
      ? facebookUrl
      : `https://www.facebook.com/${slug}`;

    await page.goto(target, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(2000);
    await dismissCookies(page);

    const postsUrl = facebookUrl.includes("profile.php")
      ? `${target}&sk=posts`
      : `https://www.facebook.com/${slug}/posts`;
    await page
      .goto(postsUrl, { waitUntil: "domcontentloaded", timeout: 60000 })
      .catch(() => undefined);
    await page.waitForTimeout(1500);
    await dismissCookies(page);

    let stagnant = 0;
    let lastCount = 0;

    for (let i = 0; i < maxScrolls; i++) {
      await page.mouse.wheel(0, 2800);
      await page.waitForTimeout(authenticated ? 1200 : 900);

      // Periodically parse full page HTML
      if (i % 3 === 0 || i === maxScrolls - 1) {
        const html = await page.content();
        mergePosts(collected, parsePostsFromHtml(html, slug));
      }

      const inWindow = collected.filter((p) => isWithinMonths(p.postDate, months));
      if (inWindow.length >= maxPosts) break;

      const oldest = oldestDated(collected);
      if (oldest && oldest < cutoff && inWindow.length > 5) {
        // Reached past the window
        break;
      }

      if (collected.length === lastCount) {
        stagnant++;
        if (stagnant >= (authenticated ? 8 : 3)) break;
      } else {
        stagnant = 0;
        lastCount = collected.length;
      }
    }

    mergePosts(
      collected,
      parsePostsFromHtml(
        [await page.content(), ...networkHtmlChunks].join("\n"),
        slug,
      ),
    );

    let parsed = collected.filter((p) => isWithinMonths(p.postDate, months));

    if (parsed.length === 0) {
      const domPosts = await page.evaluate(() => {
        const out: Array<{ text: string; href: string | null }> = [];
        for (const n of document.querySelectorAll('[role="article"]')) {
          const text = ((n as HTMLElement).innerText || "")
            .replace(/\s+/g, " ")
            .trim();
          const link = n.querySelector(
            'a[href*="/posts/"], a[href*="/permalink/"]',
          ) as HTMLAnchorElement | null;
          if (text.length > 40) {
            out.push({ text: text.slice(0, 2000), href: link?.href || null });
          }
        }
        return out;
      });
      for (const [i, p] of domPosts.entries()) {
        parsed.push({
          source: "facebook",
          sourcePostId: `fb-dom:${slug}:${i}:${hashText(p.text)}`,
          sourceUrl: p.href,
          postDate: null,
          postText: p.text,
        });
      }
    }

    return parsed.slice(0, maxPosts);
  } finally {
    await page.close().catch(() => undefined);
  }
}

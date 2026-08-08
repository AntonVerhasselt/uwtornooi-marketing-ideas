import fs from "node:fs";
import path from "node:path";
import type { BrowserContext, Browser } from "playwright";
import { chromium } from "playwright";

export type SocialPlatform = "facebook" | "instagram";

const AUTH_ROOT = path.join(process.cwd(), "data", "auth");

export function authDir(platform: SocialPlatform): string {
  return path.join(AUTH_ROOT, `${platform}-profile`);
}

export function authMarkerPath(platform: SocialPlatform): string {
  return path.join(AUTH_ROOT, `${platform}.json`);
}

export type AuthStatus = {
  platform: SocialPlatform;
  loggedIn: boolean;
  profilePath: string;
  markerPath: string;
  savedAt: string | null;
  accountHint: string | null;
};

function ensureAuthRoot(): void {
  fs.mkdirSync(AUTH_ROOT, { recursive: true });
}

export function getAuthStatus(platform: SocialPlatform): AuthStatus {
  ensureAuthRoot();
  const markerPath = authMarkerPath(platform);
  const profilePath = authDir(platform);
  if (!fs.existsSync(markerPath)) {
    return {
      platform,
      loggedIn: false,
      profilePath,
      markerPath,
      savedAt: null,
      accountHint: null,
    };
  }
  try {
    const raw = JSON.parse(fs.readFileSync(markerPath, "utf8")) as {
      savedAt?: string;
      accountHint?: string;
      loggedIn?: boolean;
    };
    return {
      platform,
      loggedIn: Boolean(raw.loggedIn),
      profilePath,
      markerPath,
      savedAt: raw.savedAt || null,
      accountHint: raw.accountHint || null,
    };
  } catch {
    return {
      platform,
      loggedIn: false,
      profilePath,
      markerPath,
      savedAt: null,
      accountHint: null,
    };
  }
}

export function writeAuthMarker(
  platform: SocialPlatform,
  accountHint?: string | null,
): void {
  ensureAuthRoot();
  fs.writeFileSync(
    authMarkerPath(platform),
    JSON.stringify(
      {
        loggedIn: true,
        savedAt: new Date().toISOString(),
        accountHint: accountHint || null,
      },
      null,
      2,
    ),
  );
}

export function clearAuth(platform: SocialPlatform): void {
  const marker = authMarkerPath(platform);
  if (fs.existsSync(marker)) fs.unlinkSync(marker);
  // Keep profile dir; user can delete manually if needed
}

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36";

export async function launchSocialContext(
  platform: SocialPlatform,
  options?: { headless?: boolean },
): Promise<{ context: BrowserContext; usingAuth: boolean }> {
  ensureAuthRoot();
  const status = getAuthStatus(platform);
  const headless = options?.headless ?? true;
  const userDataDir = authDir(platform);
  fs.mkdirSync(userDataDir, { recursive: true });

  const context = await chromium.launchPersistentContext(userDataDir, {
    headless,
    viewport: { width: 1280, height: 900 },
    locale: "nl-BE",
    userAgent: UA,
    args: ["--disable-blink-features=AutomationControlled"],
  });

  return { context, usingAuth: status.loggedIn };
}

/** Fallback non-persistent context when no profile is needed. */
export async function launchEphemeralContext(
  browser: Browser,
): Promise<BrowserContext> {
  return browser.newContext({
    userAgent: UA,
    locale: "nl-BE",
    viewport: { width: 1280, height: 900 },
  });
}

/** Cookie-only check — never navigates (safe to poll during manual login). */
export async function detectFacebookSessionCookies(
  context: BrowserContext,
): Promise<{ loggedIn: boolean; accountHint: string | null }> {
  const cookies = await context.cookies("https://www.facebook.com");
  const cUser = cookies.find((c) => c.name === "c_user");
  const xs = cookies.find((c) => c.name === "xs");
  const loggedIn = Boolean(cUser?.value && xs?.value);
  return {
    loggedIn,
    accountHint: cUser?.value?.slice(0, 12) || null,
  };
}

/** Cookie-only check — never navigates (safe to poll during manual login). */
export async function detectInstagramSessionCookies(
  context: BrowserContext,
): Promise<{ loggedIn: boolean; accountHint: string | null }> {
  const cookies = await context.cookies("https://www.instagram.com");
  const session = cookies.find((c) => c.name === "sessionid");
  const dsUser = cookies.find(
    (c) => c.name === "ds_user" || c.name === "ds_user_id",
  );
  return {
    loggedIn: Boolean(session?.value),
    accountHint: dsUser?.value || (session?.value ? "session" : null),
  };
}

export async function detectFacebookLoggedIn(
  context: BrowserContext,
): Promise<{ loggedIn: boolean; accountHint: string | null }> {
  // Prefer cookies — do not navigate away from an in-progress login.
  const fromCookies = await detectFacebookSessionCookies(context);
  if (fromCookies.loggedIn) return fromCookies;

  const page = context.pages()[0] || (await context.newPage());
  const url = page.url();
  // Only load FB if we are not already on a facebook host (avoids login flicker).
  if (!/facebook\.com/i.test(url)) {
    await page.goto("https://www.facebook.com/", {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await page.waitForTimeout(1500);
  }

  if (/login|checkpoint/i.test(page.url())) {
    return { loggedIn: false, accountHint: null };
  }

  const loggedIn = await page
    .evaluate(() => {
      const hasNav = Boolean(document.querySelector('[role="navigation"]'));
      const loginForm = Boolean(
        document.querySelector('input[name="email"], input[name="pass"]'),
      );
      return hasNav && !loginForm;
    })
    .catch(() => false);

  const again = await detectFacebookSessionCookies(context);
  return {
    loggedIn: Boolean(loggedIn || again.loggedIn),
    accountHint: again.accountHint,
  };
}

export async function detectInstagramLoggedIn(
  context: BrowserContext,
): Promise<{ loggedIn: boolean; accountHint: string | null }> {
  const fromCookies = await detectInstagramSessionCookies(context);
  if (fromCookies.loggedIn) return fromCookies;

  const page = context.pages()[0] || (await context.newPage());
  if (!/instagram\.com/i.test(page.url())) {
    await page.goto("https://www.instagram.com/", {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await page.waitForTimeout(1500);
  }

  return detectInstagramSessionCookies(context);
}

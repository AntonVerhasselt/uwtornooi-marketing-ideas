/**
 * Interactive Facebook / Instagram login.
 *
 * Usage:
 *   npm run intel:login:facebook
 *   npm run intel:login:instagram
 *
 * A browser window opens. Log in manually (2FA ok). When the script detects
 * a session cookie, it saves the profile under data/auth/ and exits.
 */
import readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";
import {
  detectFacebookLoggedIn,
  detectInstagramLoggedIn,
  launchSocialContext,
  writeAuthMarker,
  type SocialPlatform,
} from "../src/lib/social-auth";

async function main() {
  const platform = (process.argv[2] || "").toLowerCase() as SocialPlatform;
  if (platform !== "facebook" && platform !== "instagram") {
    console.error("Usage: tsx scripts/login-social.ts facebook|instagram");
    process.exit(1);
  }

  console.log(`\n=== ${platform} login ===`);
  console.log("A browser window will open on THIS agent desktop.");
  console.log("1. Log in with your account (complete 2FA if asked).");
  console.log("2. Stay on the home feed once you are in.");
  console.log("3. This script auto-saves when login is detected (no Enter needed).");
  console.log("   You can still press Enter to force a check.\n");

  const { context } = await launchSocialContext(platform, { headless: false });
  const page = context.pages()[0] || (await context.newPage());

  const startUrl =
    platform === "facebook"
      ? "https://www.facebook.com/login"
      : "https://www.instagram.com/accounts/login/";

  await page.goto(startUrl, { waitUntil: "domcontentloaded", timeout: 60000 });

  let detected = false;
  let accountHint: string | null = null;
  const started = Date.now();
  const maxMs = 15 * 60 * 1000;
  let stopPolling = false;

  const checkOnce = async () => {
    const result =
      platform === "facebook"
        ? await detectFacebookLoggedIn(context)
        : await detectInstagramLoggedIn(context);
    if (result.loggedIn) {
      detected = true;
      accountHint = result.accountHint;
    }
    return result.loggedIn;
  };

  // Optional Enter to force an immediate check (does not block auto-detect)
  const rl = readline.createInterface({ input, output });
  rl.question("Press Enter anytime to force a login check… ", async () => {
    console.log("\nManual check…");
    try {
      if (await checkOnce()) {
        console.log("✓ Login detected via manual check.");
        stopPolling = true;
      } else {
        console.log("Not logged in yet — keep going in the browser.");
      }
    } catch (e) {
      console.log("Check failed:", e instanceof Error ? e.message : e);
    }
  });

  while (!detected && !stopPolling && Date.now() - started < maxMs) {
    try {
      // Lightweight cookie-only poll every 4s (avoid hammering navigation)
      const cookies = await context.cookies(
        platform === "facebook"
          ? "https://www.facebook.com"
          : "https://www.instagram.com",
      );
      const loggedInCookie =
        platform === "facebook"
          ? cookies.some((c) => c.name === "c_user" && Boolean(c.value))
          : cookies.some((c) => c.name === "sessionid" && Boolean(c.value));
      if (loggedInCookie) {
        await checkOnce();
        if (detected) {
          console.log("\n✓ Login detected. Saving session…");
          break;
        }
      }
    } catch {
      // ignore transient errors while user interacts
    }
    await new Promise((r) => setTimeout(r, 4000));
  }

  rl.close();

  if (!detected) {
    try {
      await checkOnce();
    } catch {
      // ignore
    }
  }

  if (!detected) {
    console.error(
      "\n✗ Could not confirm login within 15 minutes. Finish login/2FA and re-run.",
    );
    await context.close();
    process.exit(1);
  }

  writeAuthMarker(platform, accountHint);
  console.log(`Saved ${platform} session to data/auth/${platform}-profile/`);
  console.log(`Marker: data/auth/${platform}.json`);
  console.log("You can close the browser; scrape will reuse this session.\n");
  await context.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

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
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import {
  detectFacebookLoggedIn,
  detectInstagramLoggedIn,
  launchSocialContext,
  writeAuthMarker,
  type SocialPlatform,
} from "../src/lib/social-auth";

async function waitForEnter(message: string): Promise<void> {
  const rl = readline.createInterface({ input, output });
  await rl.question(message);
  rl.close();
}

async function main() {
  const platform = (process.argv[2] || "").toLowerCase() as SocialPlatform;
  if (platform !== "facebook" && platform !== "instagram") {
    console.error("Usage: tsx scripts/login-social.ts facebook|instagram");
    process.exit(1);
  }

  console.log(`\n=== ${platform} login ===`);
  console.log("A browser window will open.");
  console.log("1. Log in with your account (complete 2FA if asked).");
  console.log("2. Stay on the home feed once you are in.");
  console.log("3. Come back here and press Enter when finished.\n");

  const { context } = await launchSocialContext(platform, { headless: false });
  const page = context.pages()[0] || (await context.newPage());

  const startUrl =
    platform === "facebook"
      ? "https://www.facebook.com/login"
      : "https://www.instagram.com/accounts/login/";

  await page.goto(startUrl, { waitUntil: "domcontentloaded", timeout: 60000 });

  // Poll in background while user logs in
  let detected = false;
  let accountHint: string | null = null;
  const started = Date.now();
  const maxMs = 10 * 60 * 1000;

  const poll = async () => {
    while (Date.now() - started < maxMs) {
      const result =
        platform === "facebook"
          ? await detectFacebookLoggedIn(context)
          : await detectInstagramLoggedIn(context);
      if (result.loggedIn) {
        detected = true;
        accountHint = result.accountHint;
        console.log("\n✓ Login detected. Saving session…");
        break;
      }
      await new Promise((r) => setTimeout(r, 3000));
    }
  };

  const pollPromise = poll();
  await waitForEnter(
    "Press Enter after you have logged in (or wait for auto-detect)… ",
  );

  if (!detected) {
    const result =
      platform === "facebook"
        ? await detectFacebookLoggedIn(context)
        : await detectInstagramLoggedIn(context);
    detected = result.loggedIn;
    accountHint = result.accountHint;
  }

  // Let poll finish quickly if still running
  await Promise.race([
    pollPromise,
    new Promise((r) => setTimeout(r, 1000)),
  ]);

  if (!detected) {
    console.error(
      "\n✗ Could not confirm login. Make sure you finished login/2FA and try again.",
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

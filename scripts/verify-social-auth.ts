/**
 * Verify a saved Playwright profile has a session cookie and write the auth marker.
 * Usage: tsx scripts/verify-social-auth.ts facebook|instagram
 */
import { chromium } from "playwright";
import {
  authDir,
  detectFacebookSessionCookies,
  detectInstagramSessionCookies,
  writeAuthMarker,
  type SocialPlatform,
} from "../src/lib/social-auth";

async function main() {
  const platform = (process.argv[2] || "").toLowerCase() as SocialPlatform;
  if (platform !== "facebook" && platform !== "instagram") {
    console.error("Usage: tsx scripts/verify-social-auth.ts facebook|instagram");
    process.exit(1);
  }

  const context = await chromium.launchPersistentContext(authDir(platform), {
    headless: true,
    args: ["--disable-blink-features=AutomationControlled"],
  });

  try {
    const result =
      platform === "facebook"
        ? await detectFacebookSessionCookies(context)
        : await detectInstagramSessionCookies(context);

    console.log(
      JSON.stringify({
        platform,
        loggedIn: result.loggedIn,
        hasAccountHint: Boolean(result.accountHint),
      }),
    );

    if (!result.loggedIn) {
      process.exitCode = 2;
      return;
    }

    writeAuthMarker(platform, result.accountHint);
    console.log("MARKER_SAVED");
  } finally {
    await context.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

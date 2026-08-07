import Link from "next/link";
import { getAuthStatus } from "@/lib/social-auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Social login",
};

function StatusCard({
  title,
  loggedIn,
  savedAt,
  accountHint,
  loginCommand,
}: {
  title: string;
  loggedIn: boolean;
  savedAt: string | null;
  accountHint: string | null;
  loginCommand: string;
}) {
  return (
    <section className="rounded-[11px] border border-border bg-bg-elevated/70 px-5 py-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="ut-display text-xl font-extrabold text-ink">{title}</h2>
        <span
          className={`rounded-[11px] px-3 py-1 text-xs font-semibold ${
            loggedIn
              ? "bg-green-tint text-green-dark"
              : "bg-border/40 text-ink-muted"
          }`}
        >
          {loggedIn ? "Logged in" : "Not logged in"}
        </span>
      </div>
      {loggedIn ? (
        <dl className="mb-4 space-y-1 text-sm text-ink-muted">
          <div>
            Saved at: {savedAt ? new Date(savedAt).toLocaleString() : "—"}
          </div>
          <div>Account hint: {accountHint || "—"}</div>
          <div className="text-ink">
            Authenticated scrape will scroll deeper (~16 months).
          </div>
        </dl>
      ) : (
        <p className="mb-4 text-sm text-ink-muted">
          Without login, {title} only exposes a thin public feed. Log in once so
          the scraper can reuse your session.
        </p>
      )}
      <div className="rounded-[11px] bg-green-tint/60 px-3 py-2 font-mono text-xs text-ink">
        {loginCommand}
      </div>
    </section>
  );
}

export default function AuthPage() {
  const facebook = getAuthStatus("facebook");
  const instagram = getAuthStatus("instagram");

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:px-8 sm:py-14">
      <p className="mb-2 text-sm text-ink-muted">
        <Link href="/intel" className="text-green-dark hover:underline">
          Tournament intel
        </Link>{" "}
        / Social login
      </p>
      <h1 className="ut-display mb-3 text-4xl font-extrabold text-ink">
        Social login
      </h1>
      <p className="mb-8 max-w-2xl text-sm leading-relaxed text-ink-muted">
        Log in here via the terminal commands below. A browser window opens in
        this environment — complete Facebook / Instagram login (including 2FA).
        The session is saved under{" "}
        <code className="rounded bg-green-tint px-1.5 py-0.5 text-xs">
          data/auth/
        </code>{" "}
        and reused by{" "}
        <code className="rounded bg-green-tint px-1.5 py-0.5 text-xs">
          npm run intel:scrape
        </code>
        .
      </p>

      <div className="mb-8 space-y-4">
        <StatusCard
          title="Facebook"
          loggedIn={facebook.loggedIn}
          savedAt={facebook.savedAt}
          accountHint={facebook.accountHint}
          loginCommand="npm run intel:login:facebook"
        />
        <StatusCard
          title="Instagram"
          loggedIn={instagram.loggedIn}
          savedAt={instagram.savedAt}
          accountHint={instagram.accountHint}
          loginCommand="npm run intel:login:instagram"
        />
      </div>

      <section className="rounded-[11px] border border-border bg-bg-elevated/70 px-5 py-5">
        <h2 className="ut-display mb-3 text-xl font-extrabold text-ink">
          How to log in
        </h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink-muted">
          <li>
            In the agent / project terminal, run{" "}
            <code className="rounded bg-green-tint px-1.5 py-0.5 text-xs text-ink">
              npm run intel:login:facebook
            </code>
            .
          </li>
          <li>
            A Chrome window opens on the desktop of this environment. Log in
            with your Facebook account and finish any 2FA / checkpoint prompts.
          </li>
          <li>
            When you see the home feed, return to the terminal and press Enter
            (or wait for auto-detect).
          </li>
          <li>
            Repeat with{" "}
            <code className="rounded bg-green-tint px-1.5 py-0.5 text-xs text-ink">
              npm run intel:login:instagram
            </code>
            .
          </li>
          <li>
            Refresh this page — both should show <strong>Logged in</strong>.
          </li>
          <li>
            Re-run scrape + analyze:
            <div className="mt-2 space-y-1 font-mono text-xs text-ink">
              <div>npm run intel:scrape</div>
              <div>npm run intel:analyze</div>
            </div>
          </li>
        </ol>
        <p className="mt-4 text-sm text-ink-muted">
          Sessions stay on this machine only (gitignored). Do not commit{" "}
          <code className="text-xs">data/auth/</code>.
        </p>
      </section>
    </main>
  );
}

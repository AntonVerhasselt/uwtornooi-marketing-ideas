import Link from "next/link";
import { listClubs } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Clubs",
};

function ExtLink({ href, label }: { href: string | null; label: string }) {
  if (!href) return <span className="text-ink-faint">—</span>;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-green-dark underline-offset-2 hover:underline"
    >
      {label}
    </a>
  );
}

export default async function ClubsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q || "";
  const clubs = await listClubs(q);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8 sm:py-14">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm text-ink-muted">
            <Link href="/intel" className="text-green-dark hover:underline">
              Tournament intel
            </Link>{" "}
            / Clubs
          </p>
          <h1 className="ut-display text-4xl font-extrabold text-ink">
            Clubs overview
          </h1>
        </div>
        <Link
          href="/intel/import"
          className="rounded-[11px] bg-green-dark px-4 py-2.5 text-sm font-medium text-white"
        >
          Import clubs
        </Link>
      </div>

      <form className="mb-6 flex gap-2" action="/intel/clubs" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search club or tournament name"
          className="w-full max-w-md rounded-[11px] border border-border bg-bg-elevated px-3 py-2.5 text-sm outline-none ring-green-dark/30 focus:ring-2"
        />
        <button
          type="submit"
          className="rounded-[11px] border border-border bg-bg-elevated px-4 py-2.5 text-sm font-medium hover:bg-green-tint"
        >
          Search
        </button>
      </form>

      <div className="overflow-x-auto rounded-[11px] border border-border bg-bg-elevated/70">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase tracking-wide text-ink-faint">
            <tr>
              <th className="px-4 py-3 font-medium">Club</th>
              <th className="px-4 py-3 font-medium">Website</th>
              <th className="px-4 py-3 font-medium">Facebook</th>
              <th className="px-4 py-3 font-medium">Instagram</th>
              <th className="px-4 py-3 font-medium">Tournaments</th>
              <th className="px-4 py-3 font-medium">Last</th>
              <th className="px-4 py-3 font-medium">Next</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clubs.map((c) => (
              <tr key={c.id} className="border-b border-border/70 last:border-0">
                <td className="px-4 py-3 font-medium text-ink">
                  <div>{c.name}</div>
                  {c.series_names ? (
                    <div className="mt-0.5 text-xs text-ink-faint">
                      {c.series_names}
                    </div>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <ExtLink href={c.website_url} label="Site" />
                </td>
                <td className="px-4 py-3">
                  <ExtLink href={c.facebook_url} label="FB" />
                </td>
                <td className="px-4 py-3">
                  <ExtLink href={c.instagram_url} label="IG" />
                </td>
                <td className="px-4 py-3">{c.tournament_count}</td>
                <td className="px-4 py-3 text-ink-muted">
                  {c.last_tournament || "—"}
                </td>
                <td className="px-4 py-3 text-ink-muted">
                  {c.next_tournament || "—"}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/intel/clubs/${c.id}`}
                    className="text-green-dark hover:underline"
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
            {clubs.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-ink-muted">
                  No clubs found. Import from RBFA or CSV first.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </main>
  );
}

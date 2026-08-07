import Link from "next/link";
import { IntelNav } from "@/components/intel/IntelNav";
import { StatusBadge } from "@/components/intel/StatusBadge";
import { listClubs } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Clubs CRM",
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
  searchParams: Promise<{ q?: string; upcoming?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q || "";
  const upcomingOnly = sp.upcoming === "1";
  const clubs = await listClubs(q);
  const rows = upcomingOnly
    ? clubs.filter((c) => c.next_tournament)
    : clubs;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8 sm:py-14">
      <IntelNav current="/intel/clubs" />

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="ut-display text-4xl font-extrabold text-ink">
            Clubs
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            {rows.length} club{rows.length === 1 ? "" : "s"}
            {upcomingOnly ? " with upcoming tournaments" : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={upcomingOnly ? "/intel/clubs" : "/intel/clubs?upcoming=1"}
            className="rounded-[11px] border border-border bg-bg-elevated px-4 py-2.5 text-sm font-medium hover:bg-green-tint"
          >
            {upcomingOnly ? "Show all clubs" : "Upcoming only"}
          </Link>
          <Link
            href="/intel/import"
            className="rounded-[11px] bg-green-dark px-4 py-2.5 text-sm font-medium text-white"
          >
            Import clubs
          </Link>
        </div>
      </div>

      <form className="mb-6 flex gap-2" action="/intel/clubs" method="get">
        {upcomingOnly ? <input type="hidden" name="upcoming" value="1" /> : null}
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
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Website</th>
              <th className="px-4 py-3 font-medium">FB</th>
              <th className="px-4 py-3 font-medium">IG</th>
              <th className="px-4 py-3 font-medium">Contacts</th>
              <th className="px-4 py-3 font-medium">Tournaments</th>
              <th className="px-4 py-3 font-medium">Next</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr
                key={c.id}
                className="border-b border-border/70 last:border-0"
              >
                <td className="px-4 py-3 font-medium text-ink">
                  <div>{c.name}</div>
                  {c.locality ? (
                    <div className="mt-0.5 text-xs text-ink-faint">
                      {c.locality}
                    </div>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={c.crm_status} />
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
                <td className="px-4 py-3 text-ink-muted">
                  {c.reachable_contacts}/{c.contact_count}
                </td>
                <td className="px-4 py-3">{c.tournament_count}</td>
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
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-ink-muted">
                  No clubs found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </main>
  );
}

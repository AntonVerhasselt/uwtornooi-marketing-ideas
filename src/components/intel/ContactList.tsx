import type { ClubContactRow } from "@/lib/db";

function displayName(c: ClubContactRow): string {
  return [c.first_name, c.last_name].filter(Boolean).join(" ") || "Unknown";
}

export function ContactList({
  contacts,
  limit,
}: {
  contacts: ClubContactRow[];
  limit?: number;
}) {
  const rows = limit ? contacts.slice(0, limit) : contacts;
  if (rows.length === 0) {
    return (
      <p className="text-sm text-ink-muted">
        No RBFA contacts loaded yet. Run{" "}
        <code className="text-xs">npm run intel:contacts</code>.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {rows.map((c) => (
        <li
          key={c.id}
          className="rounded-[11px] border border-border/70 bg-bg/40 px-3 py-2.5"
        >
          <p className="font-medium text-ink">{displayName(c)}</p>
          {c.function_name ? (
            <p className="mt-0.5 text-xs text-ink-faint">{c.function_name}</p>
          ) : null}
          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {c.email ? (
              <a
                href={`mailto:${c.email}`}
                className="text-green-dark hover:underline"
              >
                {c.email}
              </a>
            ) : (
              <span className="text-ink-faint">No email</span>
            )}
            {c.phone ? (
              <a
                href={`tel:${c.phone.replace(/[^\d+]/g, "")}`}
                className="text-green-dark hover:underline"
              >
                {c.phone}
              </a>
            ) : null}
          </div>
        </li>
      ))}
      {limit && contacts.length > limit ? (
        <li className="text-xs text-ink-faint">
          +{contacts.length - limit} more on club page
        </li>
      ) : null}
    </ul>
  );
}

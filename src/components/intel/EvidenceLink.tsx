import { evidenceSourceLabel } from "@/lib/crm";

export function EvidenceLink({
  source,
  url,
  compact = false,
}: {
  source: string | null | undefined;
  url: string | null | undefined;
  compact?: boolean;
}) {
  const label = evidenceSourceLabel(source);
  if (!url) {
    return (
      <span className="text-sm text-ink-faint">
        {compact ? label : `Found on ${label} (no link)`}
      </span>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-green-dark underline-offset-2 hover:underline"
    >
      <span className="rounded-[6px] bg-green-tint px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-green-dark">
        {label}
      </span>
      {compact ? "Open source" : "Open post / page"}
    </a>
  );
}

import { crmStatusLabel } from "@/lib/crm";

const TONES: Record<string, string> = {
  new: "bg-green-tint text-green-dark",
  to_contact: "bg-green-light/40 text-green-dark",
  contacted: "bg-bg-elevated text-ink border border-border",
  interested: "bg-green-dark text-white",
  not_interested: "bg-bg text-ink-faint border border-border",
  won: "bg-green text-white",
  deferred: "bg-bg-elevated text-ink-muted border border-border",
};

export function StatusBadge({ status }: { status: string | null | undefined }) {
  const key = status || "new";
  return (
    <span
      className={`inline-flex rounded-[8px] px-2 py-0.5 text-xs font-medium ${TONES[key] || TONES.new}`}
    >
      {crmStatusLabel(key)}
    </span>
  );
}

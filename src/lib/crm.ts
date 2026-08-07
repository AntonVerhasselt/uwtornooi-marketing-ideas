import type { CrmStatus } from "./db";

export const CRM_STATUSES: Array<{
  value: CrmStatus;
  label: string;
}> = [
  { value: "new", label: "New" },
  { value: "to_contact", label: "To contact" },
  { value: "contacted", label: "Contacted" },
  { value: "interested", label: "Interested" },
  { value: "not_interested", label: "Not interested" },
  { value: "won", label: "Won" },
  { value: "deferred", label: "Deferred" },
];

export function crmStatusLabel(status: string | null | undefined): string {
  return CRM_STATUSES.find((s) => s.value === status)?.label || status || "New";
}

export function isCrmStatus(value: string): value is CrmStatus {
  return CRM_STATUSES.some((s) => s.value === value);
}

export function evidenceSourceLabel(source: string | null | undefined): string {
  switch (source) {
    case "facebook":
      return "Facebook";
    case "instagram":
      return "Instagram";
    case "blog":
      return "Blog / website";
    case "website":
      return "Website";
    default:
      return source ? source : "Unknown";
  }
}

/** Prefer candidate source URL, fall back to stored post URL. */
export function resolveEvidenceUrl(
  sourceUrl: string | null | undefined,
  postUrl: string | null | undefined,
): string | null {
  const a = sourceUrl?.trim();
  if (a) return a;
  const b = postUrl?.trim();
  return b || null;
}

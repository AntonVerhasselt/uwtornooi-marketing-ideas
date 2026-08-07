"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateClubCrm } from "@/app/intel/actions";
import { CRM_STATUSES } from "@/lib/crm";
import type { CrmStatus } from "@/lib/db";

export function CrmStatusForm({
  clubId,
  status,
  notes,
  lastContactedAt,
}: {
  clubId: number;
  status: CrmStatus;
  notes: string | null;
  lastContactedAt: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="space-y-3"
      action={(formData) => {
        setError(null);
        setSaved(false);
        startTransition(async () => {
          const result = await updateClubCrm(clubId, formData);
          if (!result.ok) {
            setError(result.error);
            return;
          }
          setSaved(true);
          router.refresh();
        });
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block text-ink-faint">CRM status</span>
          <select
            name="crm_status"
            defaultValue={status}
            className="w-full rounded-[11px] border border-border bg-bg px-3 py-2.5 outline-none ring-green-dark/30 focus:ring-2"
          >
            {CRM_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-end gap-2 pb-2 text-sm text-ink-muted">
          <input type="checkbox" name="mark_contacted" value="1" className="mt-0.5" />
          Stamp last contacted now
        </label>
      </div>
      <label className="block text-sm">
        <span className="mb-1 block text-ink-faint">Notes</span>
        <textarea
          name="crm_notes"
          defaultValue={notes || ""}
          rows={3}
          placeholder="Who to call, registration timing, follow-up…"
          className="w-full rounded-[11px] border border-border bg-bg px-3 py-2.5 outline-none ring-green-dark/30 focus:ring-2"
        />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-[11px] bg-green-dark px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save CRM"}
        </button>
        {lastContactedAt ? (
          <span className="text-xs text-ink-faint">
            Last contacted: {lastContactedAt.slice(0, 16).replace("T", " ")}
          </span>
        ) : null}
        {saved ? (
          <span className="text-xs text-green-dark">Saved</span>
        ) : null}
        {error ? <span className="text-xs text-red-700">{error}</span> : null}
      </div>
    </form>
  );
}

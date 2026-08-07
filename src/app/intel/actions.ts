"use server";

import { revalidatePath } from "next/cache";
import { getDb, type CrmStatus } from "@/lib/db";
import { isCrmStatus } from "@/lib/crm";

export type CrmUpdateResult = { ok: true } | { ok: false; error: string };

export async function updateClubCrm(
  clubId: number,
  formData: FormData,
): Promise<CrmUpdateResult> {
  if (!Number.isFinite(clubId) || clubId <= 0) {
    return { ok: false, error: "Invalid club id" };
  }

  const statusRaw = String(formData.get("crm_status") || "").trim();
  if (!isCrmStatus(statusRaw)) {
    return { ok: false, error: "Invalid CRM status" };
  }
  const status: CrmStatus = statusRaw;
  const notes = String(formData.get("crm_notes") || "").trim() || null;
  const markContacted = formData.get("mark_contacted") === "1";

  const db = getDb();
  const existing = db
    .prepare(`SELECT id, crm_status FROM clubs WHERE id = ?`)
    .get(clubId) as { id: number; crm_status: string } | undefined;
  if (!existing) {
    return { ok: false, error: "Club not found" };
  }

  const contactedStatuses: CrmStatus[] = [
    "contacted",
    "interested",
    "not_interested",
    "won",
  ];
  const shouldStampContacted =
    markContacted ||
    (contactedStatuses.includes(status) && existing.crm_status !== status);

  db.prepare(
    `UPDATE clubs SET
       crm_status = ?,
       crm_notes = ?,
       last_contacted_at = CASE
         WHEN ? = 1 THEN CURRENT_TIMESTAMP
         ELSE last_contacted_at
       END
     WHERE id = ?`,
  ).run(status, notes, shouldStampContacted ? 1 : 0, clubId);

  revalidatePath("/intel");
  revalidatePath("/intel/clubs");
  revalidatePath(`/intel/clubs/${clubId}`);
  return { ok: true };
}

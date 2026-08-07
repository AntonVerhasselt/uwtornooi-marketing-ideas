/**
 * Fetch RBFA contacts for clubs already in the DB (no series re-import).
 *
 * Usage:
 *   npx tsx scripts/enrich-contacts.ts              # all clubs
 *   npx tsx scripts/enrich-contacts.ts --upcoming   # clubs with upcoming tournaments
 *   npx tsx scripts/enrich-contacts.ts --dry-run
 */
import { getDb, logScrape, replaceClubContacts } from "../src/lib/db";
import { getClubInfo, sleep } from "../src/lib/rbfa";

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const upcomingOnly = process.argv.includes("--upcoming");
  const db = getDb();
  const today = new Date().toISOString().slice(0, 10);

  const clubs = (
    upcomingOnly
      ? db
          .prepare(
            `SELECT DISTINCT c.id, c.rbfa_club_id, c.name
             FROM clubs c
             JOIN tournaments t ON t.club_id = c.id
             WHERE c.rbfa_club_id IS NOT NULL
               AND t.event_date IS NOT NULL AND t.event_date >= ?
             ORDER BY c.name`,
          )
          .all(today)
      : db
          .prepare(
            `SELECT id, rbfa_club_id, name FROM clubs
             WHERE rbfa_club_id IS NOT NULL
             ORDER BY name`,
          )
          .all()
  ) as Array<{ id: number; rbfa_club_id: string; name: string }>;

  console.log(
    `${dryRun ? "[dry-run] " : ""}Enriching contacts for ${clubs.length} clubs${upcomingOnly ? " (upcoming only)" : ""}`,
  );

  let ok = 0;
  let fail = 0;
  let contactCount = 0;

  for (const club of clubs) {
    try {
      const info = await getClubInfo(club.rbfa_club_id);
      if (!info) {
        fail++;
        console.log(`  miss ${club.name}`);
        continue;
      }
      contactCount += info.contacts.length;
      if (!dryRun) {
        replaceClubContacts(club.id, info.contacts);
      }
      ok++;
      if (ok % 25 === 0) {
        console.log(`  ${ok}/${clubs.length}…`);
      }
    } catch (e) {
      fail++;
      logScrape(
        club.id,
        "rbfa_contacts",
        "error",
        e instanceof Error ? e.message : String(e),
      );
      console.log(
        `  fail ${club.name}: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
    await sleep(100);
  }

  const stored = (
    db.prepare(`SELECT COUNT(*) AS c FROM club_contacts`).get() as {
      c: number;
    }
  ).c;
  console.log(
    `Done. ok=${ok} fail=${fail} contacts_seen=${contactCount} contacts_in_db=${stored}${dryRun ? " (dry-run, no writes)" : ""}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

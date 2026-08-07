import { connection } from "next/server";
import { getDb, type ClubRow, type PostRow, type TournamentRow } from "./db";

export type DashboardStats = {
  totalClubs: number;
  websitesCrawled: number;
  facebookPagesFound: number;
  instagramFound: number;
  tournamentPosts: number;
  upcomingTournaments: number;
  candidatePosts: number;
  analyzedCandidates: number;
};

export type ClubListItem = ClubRow & {
  tournament_count: number;
  last_tournament: string | null;
  next_tournament: string | null;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  await connection();
  const db = getDb();
  const today = new Date().toISOString().slice(0, 10);
  return {
    totalClubs: (
      db.prepare(`SELECT COUNT(*) AS c FROM clubs`).get() as { c: number }
    ).c,
    websitesCrawled: (
      db
        .prepare(
          `SELECT COUNT(*) AS c FROM clubs WHERE crawled_at IS NOT NULL`,
        )
        .get() as { c: number }
    ).c,
    facebookPagesFound: (
      db
        .prepare(
          `SELECT COUNT(*) AS c FROM clubs WHERE facebook_url IS NOT NULL AND facebook_url != ''`,
        )
        .get() as { c: number }
    ).c,
    instagramFound: (
      db
        .prepare(
          `SELECT COUNT(*) AS c FROM clubs WHERE instagram_url IS NOT NULL AND instagram_url != ''`,
        )
        .get() as { c: number }
    ).c,
    tournamentPosts: (
      db.prepare(`SELECT COUNT(*) AS c FROM posts`).get() as { c: number }
    ).c,
    upcomingTournaments: (
      db
        .prepare(
          `SELECT COUNT(*) AS c FROM tournaments WHERE event_date IS NOT NULL AND event_date >= ?`,
        )
        .get(today) as { c: number }
    ).c,
    candidatePosts: (
      db.prepare(`SELECT COUNT(*) AS c FROM candidate_posts`).get() as {
        c: number;
      }
    ).c,
    analyzedCandidates: (
      db
        .prepare(`SELECT COUNT(*) AS c FROM candidate_posts WHERE analyzed = 1`)
        .get() as { c: number }
    ).c,
  };
}

export async function listClubs(search?: string): Promise<ClubListItem[]> {
  await connection();
  const db = getDb();
  const today = new Date().toISOString().slice(0, 10);
  const q = `
    SELECT
      c.*,
      (SELECT COUNT(*) FROM tournaments t WHERE t.club_id = c.id) AS tournament_count,
      (SELECT MAX(event_date) FROM tournaments t WHERE t.club_id = c.id AND t.event_date IS NOT NULL AND t.event_date < ?) AS last_tournament,
      (SELECT MIN(event_date) FROM tournaments t WHERE t.club_id = c.id AND t.event_date IS NOT NULL AND t.event_date >= ?) AS next_tournament
    FROM clubs c
    WHERE (? = '' OR c.name LIKE ? OR EXISTS (
      SELECT 1 FROM tournaments t
      WHERE t.club_id = c.id AND t.tournament_name LIKE ?
    ))
    ORDER BY tournament_count DESC, c.name ASC
  `;
  const term = (search || "").trim();
  const like = `%${term}%`;
  return db.prepare(q).all(today, today, term, like, like) as ClubListItem[];
}

export async function getClub(id: number): Promise<ClubRow | null> {
  await connection();
  const row = getDb().prepare(`SELECT * FROM clubs WHERE id = ?`).get(id);
  return (row as ClubRow) || null;
}

export async function getClubTournaments(
  clubId: number,
): Promise<TournamentRow[]> {
  await connection();
  return getDb()
    .prepare(
      `SELECT * FROM tournaments WHERE club_id = ? ORDER BY
        CASE WHEN event_date IS NULL THEN 1 ELSE 0 END,
        event_date DESC,
        created_at DESC`,
    )
    .all(clubId) as TournamentRow[];
}

export async function getClubPosts(
  clubId: number,
): Promise<Array<PostRow & { tournament_name: string | null; confidence: number | null }>> {
  await connection();
  return getDb()
    .prepare(
      `SELECT p.*, t.tournament_name, t.confidence
       FROM posts p
       LEFT JOIN tournaments t ON t.post_id = p.id
       WHERE p.club_id = ?
       ORDER BY p.post_date DESC, p.created_at DESC`,
    )
    .all(clubId) as Array<
    PostRow & { tournament_name: string | null; confidence: number | null }
  >;
}

export async function getUpcomingTournaments(limit = 20): Promise<
  Array<TournamentRow & { club_name: string }>
> {
  await connection();
  const today = new Date().toISOString().slice(0, 10);
  return getDb()
    .prepare(
      `SELECT t.*, c.name AS club_name
       FROM tournaments t
       JOIN clubs c ON c.id = t.club_id
       WHERE t.event_date IS NOT NULL AND t.event_date >= ?
       ORDER BY t.event_date ASC
       LIMIT ?`,
    )
    .all(today, limit) as Array<TournamentRow & { club_name: string }>;
}

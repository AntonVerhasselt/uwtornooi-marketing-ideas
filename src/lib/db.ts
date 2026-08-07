import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = process.env.SQLITE_PATH || path.join(DATA_DIR, "tournament-intel.db");

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (dbInstance) return dbInstance;

  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  migrate(db);
  dbInstance = db;
  return db;
}

export function getDbPath(): string {
  return DB_PATH;
}

function migrate(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS clubs (
      id INTEGER PRIMARY KEY,
      rbfa_club_id TEXT UNIQUE,
      name TEXT NOT NULL,
      website_url TEXT,
      facebook_url TEXT,
      instagram_url TEXT,
      series_names TEXT,
      locality TEXT,
      crawled_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS discovered_pages (
      id INTEGER PRIMARY KEY,
      club_id INTEGER NOT NULL,
      url TEXT NOT NULL,
      page_type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(club_id, url),
      FOREIGN KEY (club_id) REFERENCES clubs(id)
    );

    CREATE TABLE IF NOT EXISTS candidate_posts (
      id INTEGER PRIMARY KEY,
      club_id INTEGER NOT NULL,
      source TEXT NOT NULL,
      source_post_id TEXT,
      source_url TEXT,
      post_date DATE,
      post_text TEXT NOT NULL,
      analyzed INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(club_id, source, source_post_id),
      FOREIGN KEY (club_id) REFERENCES clubs(id)
    );

    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY,
      club_id INTEGER NOT NULL,
      candidate_post_id INTEGER,
      facebook_post_url TEXT,
      post_date DATE,
      post_text TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (club_id) REFERENCES clubs(id),
      FOREIGN KEY (candidate_post_id) REFERENCES candidate_posts(id)
    );

    CREATE TABLE IF NOT EXISTS tournaments (
      id INTEGER PRIMARY KEY,
      club_id INTEGER NOT NULL,
      post_id INTEGER,
      tournament_name TEXT,
      category TEXT,
      age_group TEXT,
      event_date DATE,
      registration_date DATE,
      summary TEXT,
      confidence REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (club_id) REFERENCES clubs(id),
      FOREIGN KEY (post_id) REFERENCES posts(id)
    );

    CREATE TABLE IF NOT EXISTS scrape_logs (
      id INTEGER PRIMARY KEY,
      club_id INTEGER,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (club_id) REFERENCES clubs(id)
    );

    CREATE TABLE IF NOT EXISTS club_contacts (
      id INTEGER PRIMARY KEY,
      club_id INTEGER NOT NULL,
      first_name TEXT,
      last_name TEXT,
      function_name TEXT,
      email TEXT,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (club_id) REFERENCES clubs(id)
    );

    CREATE INDEX IF NOT EXISTS idx_clubs_name ON clubs(name);
    CREATE INDEX IF NOT EXISTS idx_posts_club ON posts(club_id);
    CREATE INDEX IF NOT EXISTS idx_tournaments_club ON tournaments(club_id);
    CREATE INDEX IF NOT EXISTS idx_tournaments_event ON tournaments(event_date);
    CREATE INDEX IF NOT EXISTS idx_candidate_analyzed ON candidate_posts(analyzed);
    CREATE INDEX IF NOT EXISTS idx_contacts_club ON club_contacts(club_id);
  `);

  // Lightweight CRM columns (safe to re-run)
  const clubCols = new Set(
    (
      db.prepare(`PRAGMA table_info(clubs)`).all() as Array<{ name: string }>
    ).map((c) => c.name),
  );
  if (!clubCols.has("crm_status")) {
    db.exec(
      `ALTER TABLE clubs ADD COLUMN crm_status TEXT NOT NULL DEFAULT 'new'`,
    );
  }
  if (!clubCols.has("crm_notes")) {
    db.exec(`ALTER TABLE clubs ADD COLUMN crm_notes TEXT`);
  }
  if (!clubCols.has("last_contacted_at")) {
    db.exec(`ALTER TABLE clubs ADD COLUMN last_contacted_at DATETIME`);
  }
}

export type CrmStatus =
  | "new"
  | "to_contact"
  | "contacted"
  | "interested"
  | "not_interested"
  | "won"
  | "deferred";

export type ClubRow = {
  id: number;
  rbfa_club_id: string | null;
  name: string;
  website_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  series_names: string | null;
  locality: string | null;
  crawled_at: string | null;
  created_at: string;
  crm_status: CrmStatus;
  crm_notes: string | null;
  last_contacted_at: string | null;
};

export type ClubContactRow = {
  id: number;
  club_id: number;
  first_name: string | null;
  last_name: string | null;
  function_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
};

export type TournamentRow = {
  id: number;
  club_id: number;
  post_id: number | null;
  tournament_name: string | null;
  category: string | null;
  age_group: string | null;
  event_date: string | null;
  registration_date: string | null;
  summary: string | null;
  confidence: number | null;
  created_at: string;
};

export type PostRow = {
  id: number;
  club_id: number;
  candidate_post_id: number | null;
  facebook_post_url: string | null;
  post_date: string | null;
  post_text: string;
  created_at: string;
};

export function logScrape(
  clubId: number | null,
  type: string,
  status: string,
  message: string,
): void {
  getDb()
    .prepare(
      `INSERT INTO scrape_logs (club_id, type, status, message) VALUES (?, ?, ?, ?)`,
    )
    .run(clubId, type, status, message);
}

export type ContactInput = {
  firstName: string | null;
  lastName: string | null;
  functionName: string | null;
  email: string | null;
  phone: string | null;
};

/** Replace all stored contacts for a club. */
export function replaceClubContacts(
  clubDbId: number,
  contacts: ContactInput[],
): void {
  const db = getDb();
  const del = db.prepare(`DELETE FROM club_contacts WHERE club_id = ?`);
  const insert = db.prepare(`
    INSERT INTO club_contacts (club_id, first_name, last_name, function_name, email, phone)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const tx = db.transaction((rows: ContactInput[]) => {
    del.run(clubDbId);
    for (const c of rows) {
      insert.run(
        clubDbId,
        c.firstName,
        c.lastName,
        c.functionName,
        c.email,
        c.phone,
      );
    }
  });
  tx(contacts);
}

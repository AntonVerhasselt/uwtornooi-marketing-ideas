import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const DATA_DIR = path.join(process.cwd(), "data");
const BUNDLED_DB_PATH =
  process.env.SQLITE_PATH || path.join(DATA_DIR, "tournament-intel.db");

let dbInstance: Database.Database | null = null;
let resolvedDbPath: string | null = null;

function isServerless(): boolean {
  return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

/**
 * On Vercel/Lambda the deploy FS is read-only. Copy the bundled DB into /tmp
 * so SQLite can open it (and optionally accept ephemeral CRM writes).
 */
function resolveDbPath(): string {
  if (resolvedDbPath) return resolvedDbPath;

  if (!isServerless()) {
    fs.mkdirSync(path.dirname(BUNDLED_DB_PATH), { recursive: true });
    resolvedDbPath = BUNDLED_DB_PATH;
    return resolvedDbPath;
  }

  const tmpPath = path.join(os.tmpdir(), "tournament-intel.db");
  const sourceCandidates = [
    BUNDLED_DB_PATH,
    path.join(process.cwd(), "data", "tournament-intel.db"),
  ];
  const source = sourceCandidates.find((p) => fs.existsSync(p));
  if (!source) {
    throw new Error(
      `SQLite database not found. Looked in: ${sourceCandidates.join(", ")}`,
    );
  }

  // Refresh /tmp copy when the bundled DB is newer (new deploy).
  let needsCopy = !fs.existsSync(tmpPath);
  if (!needsCopy) {
    const srcStat = fs.statSync(source);
    const tmpStat = fs.statSync(tmpPath);
    needsCopy = srcStat.mtimeMs > tmpStat.mtimeMs || srcStat.size !== tmpStat.size;
  }
  if (needsCopy) {
    fs.copyFileSync(source, tmpPath);
  }

  resolvedDbPath = tmpPath;
  return resolvedDbPath;
}

export function getDb(): Database.Database {
  if (dbInstance) return dbInstance;

  const dbPath = resolveDbPath();
  const db = new Database(dbPath);
  // Avoid stealing the live DB from a long-running scrape/import.
  db.pragma("busy_timeout = 8000");
  // WAL needs sidecar files; avoid it on read-only / ephemeral hosts.
  db.pragma(isServerless() ? "journal_mode = DELETE" : "journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  migrate(db);
  dbInstance = db;
  return db;
}

export function getDbPath(): string {
  return resolveDbPath();
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

    CREATE TABLE IF NOT EXISTS tournament_events (
      id INTEGER PRIMARY KEY,
      club_id INTEGER NOT NULL,
      name TEXT,
      category TEXT,
      age_groups TEXT,
      start_date DATE,
      end_date DATE,
      registration_date DATE,
      summary TEXT,
      confidence REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (club_id) REFERENCES clubs(id)
    );

    CREATE TABLE IF NOT EXISTS tournament_event_sources (
      id INTEGER PRIMARY KEY,
      event_id INTEGER NOT NULL,
      tournament_id INTEGER,
      post_id INTEGER,
      source TEXT,
      source_url TEXT,
      FOREIGN KEY (event_id) REFERENCES tournament_events(id) ON DELETE CASCADE,
      FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
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
    CREATE INDEX IF NOT EXISTS idx_tournament_events_club ON tournament_events(club_id);
    CREATE INDEX IF NOT EXISTS idx_tournament_events_start ON tournament_events(start_date);
    CREATE INDEX IF NOT EXISTS idx_tournament_event_sources_event ON tournament_event_sources(event_id);
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

export type TournamentEventRow = {
  id: number;
  club_id: number;
  name: string | null;
  category: string | null;
  age_groups: string | null;
  start_date: string | null;
  end_date: string | null;
  registration_date: string | null;
  summary: string | null;
  confidence: number | null;
  created_at: string;
};

export type TournamentEventSourceRow = {
  id: number;
  event_id: number;
  tournament_id: number | null;
  post_id: number | null;
  source: string | null;
  source_url: string | null;
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

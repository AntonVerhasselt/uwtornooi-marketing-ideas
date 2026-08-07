import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  // SQLite DB is opened at runtime via path, so Next file tracing won't
  // pick it up unless we include it for intel + API routes.
  outputFileTracingIncludes: {
    "/intel": ["./data/tournament-intel.db"],
    "/intel/clubs": ["./data/tournament-intel.db"],
    "/intel/clubs/[id]": ["./data/tournament-intel.db"],
    "/intel/import": ["./data/tournament-intel.db"],
    "/intel/auth": ["./data/tournament-intel.db"],
    "/api/clubs": ["./data/tournament-intel.db"],
    "/api/import/csv": ["./data/tournament-intel.db"],
    "/api/auth/status": ["./data/tournament-intel.db"],
  },
};

export default nextConfig;

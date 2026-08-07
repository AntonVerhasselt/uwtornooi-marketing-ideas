import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseCsv(text: string): Array<{ club_name: string; website_url: string }> {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return [];

  const rows: Array<{ club_name: string; website_url: string }> = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const lower = line.toLowerCase();
    if (i === 0 && lower.includes("club_name") && lower.includes("website")) {
      continue;
    }
    const parts = line.split(",").map((p) => p.trim().replace(/^"|"$/g, ""));
    if (parts.length < 2) continue;
    const club_name = parts[0] || "";
    const website_url = parts.slice(1).join(",").trim();
    if (!club_name) continue;
    rows.push({ club_name, website_url });
  }
  return rows;
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  let csvText = "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("file");
    if (file instanceof File) {
      csvText = await file.text();
    } else {
      csvText = String(form.get("csv") || "");
    }
  } else if (contentType.includes("application/json")) {
    const body = (await request.json()) as { csv?: string };
    csvText = body.csv || "";
  } else {
    csvText = await request.text();
  }

  const rows = parseCsv(csvText);
  if (!rows.length) {
    return NextResponse.json({ error: "No rows found" }, { status: 400 });
  }

  const db = getDb();
  const insert = db.prepare(
    `INSERT INTO clubs (name, website_url) VALUES (?, ?)`,
  );
  let inserted = 0;
  const tx = db.transaction(() => {
    for (const row of rows) {
      insert.run(row.club_name, row.website_url || null);
      inserted++;
    }
  });
  tx();

  return NextResponse.json({ inserted, total: rows.length });
}

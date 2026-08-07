import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { listClubs } from "@/lib/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const clubs = await listClubs(q);
  return NextResponse.json({ clubs });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    website_url?: string;
    facebook_url?: string;
    instagram_url?: string;
  };

  const name = (body.name || "").trim();
  const website = (body.website_url || "").trim() || null;
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const info = getDb()
    .prepare(
      `INSERT INTO clubs (name, website_url, facebook_url, instagram_url)
       VALUES (?, ?, ?, ?)`,
    )
    .run(
      name,
      website,
      (body.facebook_url || "").trim() || null,
      (body.instagram_url || "").trim() || null,
    );

  return NextResponse.json({ id: Number(info.lastInsertRowid) });
}

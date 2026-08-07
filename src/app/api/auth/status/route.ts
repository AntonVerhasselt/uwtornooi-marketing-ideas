import { NextResponse } from "next/server";
import { getAuthStatus } from "@/lib/social-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    facebook: getAuthStatus("facebook"),
    instagram: getAuthStatus("instagram"),
  });
}

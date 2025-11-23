import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId =
    searchParams.get("projectId") || process.env.DEFAULT_PROJECT_ID!;

  const r = await supabaseAdmin
    .from("projects")
    .select("api_key")
    .eq("id", projectId)
    .single();

  if (r.error) {
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  return NextResponse.json({ api_key: r.data.api_key });
}

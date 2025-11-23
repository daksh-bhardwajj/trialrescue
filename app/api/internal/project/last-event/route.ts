import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId =
    searchParams.get("projectId") || process.env.DEFAULT_PROJECT_ID!;

  const { data, error } = await supabaseAdmin
    .from("events")
    .select("created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching last event", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ last_event_at: null });
  }

  return NextResponse.json({ last_event_at: data.created_at });
}

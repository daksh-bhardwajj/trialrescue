import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // for testing only — later change to founder domains
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization");
    if (!auth || !auth.startsWith("Bearer "))
      return NextResponse.json({ error: "Missing API key" }, { status: 401, headers: corsHeaders });

    const apiKey = auth.split(" ")[1];

    const { data: project, error: keyErr } = await supabaseAdmin
      .from("projects")
      .select("id")
      .eq("api_key", apiKey)
      .single();
    if (keyErr || !project)
      return NextResponse.json({ error: "Invalid API key" }, { status: 401, headers: corsHeaders });

    const body = await req.json().catch(() => null);
    if (!body || !body.event_type)
      return NextResponse.json({ error: "Missing event_type" }, { status: 400, headers: corsHeaders });

    const { event_type, external_user_id, email, data } = body;

    await supabaseAdmin.from("events").insert({
      project_id: project.id,
      event_type,
      external_user_id,
      data,
    });

    if (event_type === "user_signed_up" && external_user_id && email) {
      await supabaseAdmin.from("project_users").upsert({
        project_id: project.id,
        external_user_id,
        email,
        trial_started_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
      });
    }

    if (event_type === "user_activity" && external_user_id) {
      await supabaseAdmin.rpc("update_last_activity", {
        p_project_id: project.id,
        p_external_user_id: external_user_id,
      });
    }

    if (event_type === "user_upgraded" && external_user_id) {
      await supabaseAdmin.rpc("mark_upgraded", {
        p_project_id: project.id,
        p_external_user_id: external_user_id,
      });
    }

    return NextResponse.json({ ok: true }, { headers: corsHeaders });
  } catch (err) {
    console.error("events error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500, headers: corsHeaders });
  }
}

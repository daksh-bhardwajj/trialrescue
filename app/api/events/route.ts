/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/events/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // for testing; later you can restrict
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization");
    if (!auth || !auth.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing API key" },
        { status: 401, headers: corsHeaders }
      );
    }

    const apiKey = auth.split(" ")[1];

    // 1) Resolve project by API key
    const { data: project, error: keyErr } = await supabaseAdmin
      .from("projects")
      .select("id")
      .eq("api_key", apiKey)
      .single();

    if (keyErr || !project) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401, headers: corsHeaders }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || !body.event_type) {
      return NextResponse.json(
        { error: "Missing event_type" },
        { status: 400, headers: corsHeaders }
      );
    }

    const { event_type, external_user_id, email, data } = body;

    if (!external_user_id) {
      return NextResponse.json(
        { error: "Missing external_user_id" },
        { status: 400, headers: corsHeaders }
      );
    }

    const nowIso = new Date().toISOString();

    // 2) Upsert project_users record (or create if not exists)
    const userPayload: any = {
      project_id: project.id,
      external_user_id,
    };

    if (email) {
      userPayload.email = email;
    }

    if (event_type === "user_signed_up") {
      userPayload.trial_started_at = nowIso;
      userPayload.last_activity_at = nowIso;
    } else if (event_type === "user_activity") {
      userPayload.last_activity_at = nowIso;
    } else if (event_type === "user_upgraded") {
      userPayload.upgraded_at = nowIso;
    }

    const { data: userRow, error: userError } = await supabaseAdmin
      .from("project_users")
      .upsert(userPayload, {
        onConflict: "project_id,external_user_id",
      })
      .select("id")
      .single();

    if (userError || !userRow) {
      console.error("events: error upserting project_users", userError);
      return NextResponse.json(
        { error: "Failed to upsert user" },
        { status: 500, headers: corsHeaders }
      );
    }

    // 3) Insert event row tied to this user
    const { error: eventError } = await supabaseAdmin.from("events").insert({
      project_id: project.id,
      user_id: userRow.id,
      event_type,
      data: data || null,
    });

    if (eventError) {
      console.error("events: error inserting event", eventError);
      // Non-fatal for the caller; we still return ok: true because user state is updated
    }

    return NextResponse.json({ ok: true }, { headers: corsHeaders });
  } catch (err) {
    console.error("events: server error", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

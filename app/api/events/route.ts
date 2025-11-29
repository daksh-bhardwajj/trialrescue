/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/events/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type IncomingEventType = "user_signed_up" | "user_activity" | "user_upgraded";

type IncomingBody = {
  event: IncomingEventType;
  user: {
    id: string;    // external user id in the founder's app
    email: string; // user's email in the founder's app
  };
  occurredAt?: string; // optional ISO string; defaults to now
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // you can restrict later
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-trialrescue-api-key",
};

function badRequest(msg: string) {
  return new NextResponse(JSON.stringify({ error: msg }), {
    status: 400,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

export async function OPTIONS() {
  // Allow preflight
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(req: NextRequest) {
  try {
    // 1) Verify API key from header
    const apiKey = req.headers.get("x-trialrescue-api-key");
    if (!apiKey) {
      console.error("events: missing x-trialrescue-api-key");
      return new NextResponse(
        JSON.stringify({ error: "Missing x-trialrescue-api-key header" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Look up project by api_key
    const { data: project, error: projectError } = await supabaseAdmin
      .from("projects")
      .select("id, billing_status, api_key")
      .eq("api_key", apiKey)
      .maybeSingle();

    if (projectError) {
      console.error("events: error looking up project by api_key", projectError);
      return new NextResponse(
        JSON.stringify({ error: "Project lookup failed" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!project) {
      console.error("events: invalid api_key", apiKey);
      return new NextResponse(
        JSON.stringify({ error: "Invalid API key" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const projectId = project.id as string;

    // 2) Parse body
    const body = (await req.json().catch(() => null)) as IncomingBody | null;
    if (!body) return badRequest("Invalid JSON body");

    const { event, user, occurredAt } = body;

    if (!event || !user || !user.id || !user.email) {
      return badRequest("Missing event or user information");
    }

    if (
      event !== "user_signed_up" &&
      event !== "user_activity" &&
      event !== "user_upgraded"
    ) {
      return badRequest("Unsupported event type");
    }

    const ts = occurredAt ? new Date(occurredAt) : new Date();
    if (Number.isNaN(ts.getTime())) {
      return badRequest("Invalid occurredAt timestamp");
    }
    const tsIso = ts.toISOString();

    // 3) Upsert into project_users (we ignore any client-sent project_id)
    const { data: existingUser, error: existingError } = await supabaseAdmin
      .from("project_users")
      .select(
        "id, trial_started_at, last_activity_at, upgraded_at, unsubscribed"
      )
      .eq("project_id", projectId)
      .eq("external_user_id", user.id)
      .maybeSingle();

    if (existingError) {
      console.error("events: error loading project_user", existingError);
      return new NextResponse(
        JSON.stringify({ error: "Error loading user" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    let trial_started_at = existingUser?.trial_started_at || null;
    let last_activity_at = existingUser?.last_activity_at || null;
    let upgraded_at = existingUser?.upgraded_at || null;

    if (event === "user_signed_up") {
      if (!trial_started_at) trial_started_at = tsIso;
      last_activity_at = tsIso;
    } else if (event === "user_activity") {
      last_activity_at = tsIso;
    } else if (event === "user_upgraded") {
      upgraded_at = tsIso;
    }

    const upsertPayload = {
      project_id: projectId,
      external_user_id: user.id,
      email: user.email,
      trial_started_at,
      last_activity_at,
      upgraded_at,
      unsubscribed: existingUser?.unsubscribed ?? false,
    };

    const { error: upsertError } = await supabaseAdmin
      .from("project_users")
      .upsert(upsertPayload, {
        onConflict: "project_id,external_user_id",
      });

    if (upsertError) {
      console.error("events: error upserting project_user", upsertError);
      return new NextResponse(
        JSON.stringify({ error: "Error saving user state" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new NextResponse(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err: any) {
    console.error("events: fatal error", err);
    return new NextResponse(
      JSON.stringify({ error: "Server error", details: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
}

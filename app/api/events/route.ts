/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Standardized flat structure matching the Client & Documentation
type IncomingEventType = "user_signed_up" | "user_activity" | "user_upgraded";

type IncomingBody = {
  event_type: IncomingEventType;
  external_user_id: string; // The ID in your (the developer's) app
  email?: string;           // Optional for activity, required for signup usually
  properties?: any;         // Optional metadata
  occurred_at?: string;     // Optional ISO string
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
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
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(req: NextRequest) {
  try {
    // 1) Verify API key
    const apiKey = req.headers.get("x-trialrescue-api-key");
    if (!apiKey) {
      return new NextResponse(
        JSON.stringify({ error: "Missing x-trialrescue-api-key header" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Lookup Project
    const { data: project, error: projectError } = await supabaseAdmin
      .from("projects")
      .select("id, billing_status")
      .eq("api_key", apiKey)
      .maybeSingle();

    if (projectError || !project) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid API Key" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const projectId = project.id;

    // 2) Parse Body
    const body = (await req.json().catch(() => null)) as IncomingBody | null;
    if (!body) return badRequest("Invalid JSON body");

    // Destructure flat fields
    const { event_type, external_user_id, email, occurred_at } = body;

    // Validation
    if (!event_type || !external_user_id) {
      return badRequest("Missing required fields: event_type or external_user_id");
    }

    // Specific validation for signup
    if (event_type === "user_signed_up" && !email) {
      return badRequest("Email is required for user_signed_up events");
    }

    const validEvents = ["user_signed_up", "user_activity", "user_upgraded"];
    if (!validEvents.includes(event_type)) {
      return badRequest(`Unsupported event_type. Must be one of: ${validEvents.join(", ")}`);
    }

    const ts = occurred_at ? new Date(occurred_at) : new Date();
    if (Number.isNaN(ts.getTime())) {
      return badRequest("Invalid occurred_at timestamp");
    }
    const tsIso = ts.toISOString();

    // 3) Upsert into project_users
    // First, check if user exists to preserve existing dates if not provided
    const { data: existingUser } = await supabaseAdmin
      .from("project_users")
      .select("trial_started_at, last_activity_at, upgraded_at, unsubscribed")
      .eq("project_id", projectId)
      .eq("external_user_id", external_user_id)
      .maybeSingle();

    let trial_started_at = existingUser?.trial_started_at || null;
    let last_activity_at = existingUser?.last_activity_at || null;
    let upgraded_at = existingUser?.upgraded_at || null;
    const unsubscribed = existingUser?.unsubscribed ?? false;

    // Update logic based on event type
    if (event_type === "user_signed_up") {
      // If trial hasn't started, start it now. 
      // If they already exist, we generally don't reset trial start unless explicitly handled, 
      // but here we ensure they are tracked.
      if (!trial_started_at) trial_started_at = tsIso;
      last_activity_at = tsIso; 
    } else if (event_type === "user_activity") {
      last_activity_at = tsIso;
    } else if (event_type === "user_upgraded") {
      upgraded_at = tsIso;
      last_activity_at = tsIso; // Upgrading counts as activity
    }

    // Prepare payload
    const upsertPayload: any = {
      project_id: projectId,
      external_user_id,
      trial_started_at,
      last_activity_at,
      upgraded_at,
      unsubscribed
    };

    // Only update email if provided (don't overwrite with null on activity events)
    if (email) {
      upsertPayload.email = email;
    }

    const { error: upsertError } = await supabaseAdmin
      .from("project_users")
      .upsert(upsertPayload, {
        onConflict: "project_id,external_user_id",
      });

    if (upsertError) {
      console.error("events: error upserting project_user", upsertError);
      return new NextResponse(
        JSON.stringify({ error: "Error saving user state", details: upsertError.message }),
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
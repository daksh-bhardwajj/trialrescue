/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/events/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type NormalizedEventType = "user_signed_up" | "user_activity" | "user_upgraded";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // you can restrict this later
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-trialrescue-api-key",
};

function jsonResponse(body: any, status = 200) {
  return new NextResponse(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

export async function OPTIONS() {
  // Preflight for browser requests
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(req: NextRequest) {
  try {
    // 1) API key from header
    const apiKey = req.headers.get("x-trialrescue-api-key");
    if (!apiKey) {
      console.error("events: missing x-trialrescue-api-key");
      return jsonResponse(
        { error: "Missing x-trialrescue-api-key header" },
        401
      );
    }

    // 2) Find project via api_key
    const { data: project, error: projectError } = await supabaseAdmin
      .from("projects")
      .select("id, billing_status, api_key")
      .eq("api_key", apiKey)
      .maybeSingle();

    if (projectError) {
      console.error("events: project lookup error", projectError);
      return jsonResponse({ error: "Project lookup failed" }, 500);
    }

    if (!project) {
      console.error("events: invalid api_key", apiKey);
      return jsonResponse({ error: "Invalid API key" }, 401);
    }

    const projectId = project.id as string;

    // 3) Parse body (support BOTH old and new formats)

    const raw = await req.json().catch(() => null);
    if (!raw || typeof raw !== "object") {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }

    let eventType: NormalizedEventType | null = null;
    let externalUserId: string | null = null;
    let email: string | null = null;
    let occurredAt: string | undefined = undefined;

    // Format A: what your integration page currently sends:
    // {
    //   "event_type": "user_signed_up",
    //   "external_user_id": "xxx",
    //   "email": "test@example.com"
    // }
    if ("event_type" in raw || "external_user_id" in raw) {
      const et = String((raw as any).event_type || "").trim();
      if (et === "user_signed_up" || et === "user_activity" || et === "user_upgraded") {
        eventType = et;
      }

      externalUserId = (raw as any).external_user_id
        ? String((raw as any).external_user_id)
        : null;
      email = (raw as any).email ? String((raw as any).email) : null;
      occurredAt = (raw as any).occurredAt || (raw as any).occurred_at;
    }

    // Format B: newer style:
    // {
    //   "event": "user_signed_up",
    //   "user": { "id": "xxx", "email": "..." },
    //   "occurredAt": "..."
    // }
    if (!eventType && "event" in raw && "user" in raw) {
      const et = String((raw as any).event || "").trim();
      if (et === "user_signed_up" || et === "user_activity" || et === "user_upgraded") {
        eventType = et as NormalizedEventType;
      }
      const user = (raw as any).user || {};
      externalUserId = user.id ? String(user.id) : null;
      email = user.email ? String(user.email) : null;
      occurredAt = (raw as any).occurredAt;
    }

    if (!eventType) {
      return jsonResponse({ error: "Unsupported or missing event type" }, 400);
    }

    if (!externalUserId || !email) {
      return jsonResponse(
        { error: "Missing external_user_id or email" },
        400
      );
    }

    const ts = occurredAt ? new Date(occurredAt) : new Date();
    if (Number.isNaN(ts.getTime())) {
      return jsonResponse({ error: "Invalid occurredAt timestamp" }, 400);
    }
    const tsIso = ts.toISOString();

    // 4) Load existing user row (if any)
    const { data: existingUser, error: existingError } = await supabaseAdmin
      .from("project_users")
      .select(
        "id, trial_started_at, last_activity_at, upgraded_at, unsubscribed"
      )
      .eq("project_id", projectId)
      .eq("external_user_id", externalUserId)
      .maybeSingle();

    if (existingError) {
      console.error("events: error loading project_user", existingError);
      return jsonResponse({ error: "Error loading user" }, 500);
    }

    let trial_started_at = existingUser?.trial_started_at || null;
    let last_activity_at = existingUser?.last_activity_at || null;
    let upgraded_at = existingUser?.upgraded_at || null;

    if (eventType === "user_signed_up") {
      if (!trial_started_at) trial_started_at = tsIso;
      last_activity_at = tsIso;
    } else if (eventType === "user_activity") {
      last_activity_at = tsIso;
    } else if (eventType === "user_upgraded") {
      upgraded_at = tsIso;
    }

    const upsertPayload = {
      project_id: projectId,
      external_user_id: externalUserId,
      email,
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
      console.error("events: upsert error", upsertError);
      return jsonResponse({ error: "Error saving user state" }, 500);
    }

    return jsonResponse({ ok: true }, 200);
  } catch (err: any) {
    console.error("events: fatal error", err);
    return jsonResponse(
      { error: "Server error", details: String(err) },
      500
    );
  }
}

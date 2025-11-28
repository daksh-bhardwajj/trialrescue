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

function badRequest(msg: string) {
  return NextResponse.json({ error: msg }, { status: 400 });
}

export async function POST(req: NextRequest) {
  try {
    // 1) Verify API key from header (this is the "3.1 Headers" part)
    const apiKey = req.headers.get("x-trialrescue-api-key");
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing x-trialrescue-api-key header" },
        { status: 401 }
      );
    }

    // Look up project by api_key
    const { data: project, error: projectError } = await supabaseAdmin
      .from("projects")
      .select("id, billing_status")
      .eq("api_key", apiKey)
      .maybeSingle();

    if (projectError) {
      console.error("events: error looking up project by api_key", projectError);
      return NextResponse.json(
        { error: "Project lookup failed" },
        { status: 500 }
      );
    }

    if (!project) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
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

    // 3) Upsert into project_users
    // NOTE: we ignore any project_id from client, we trust only api_key → project.id

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
      return NextResponse.json(
        { error: "Error loading user" },
        { status: 500 }
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
      return NextResponse.json(
        { error: "Error saving user state" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("events: fatal error", err);
    return NextResponse.json(
      { error: "Server error", details: String(err) },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

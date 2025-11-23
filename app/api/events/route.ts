/* eslint-disable prefer-const */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const DEFAULT_PROJECT_ID = process.env.DEFAULT_PROJECT_ID!;

const eventSchema = z.object({
  event_type: z.enum(["user_signed_up", "user_activity", "user_upgraded"]),
  external_user_id: z.string().min(1),
  email: z.string().email().optional(), // only required for signup
  timestamp: z.string().datetime().optional(), // ISO string
  data: z.record(z.string(), z.any()).optional(),
});

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
if (!auth || !auth.startsWith("Bearer ")) {
  return NextResponse.json({ error: "Missing API key" }, { status: 401 });
}
const apiKey = auth.replace("Bearer ", "").trim();

const projectRes = await supabaseAdmin
  .from("projects")
  .select("id")
  .eq("api_key", apiKey)
  .single();

if (projectRes.error || !projectRes.data) {
  return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
}

const projectId = projectRes.data.id;

  try {
    const json = await req.json();
    const parseResult = eventSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { event_type, external_user_id, email, timestamp, data } = parseResult.data;
    const eventTime = timestamp ? new Date(timestamp).toISOString() : new Date().toISOString();

    // Ensure the user exists (or create)
    // For activity/upgrade, user must already exist from a prior signup
    let userRes = await supabaseAdmin
      .from("project_users")
      .select("*")
      .eq("project_id", projectId)
      .eq("external_user_id", external_user_id)
      .maybeSingle();

    let user = userRes.data;
    const userError = userRes.error;

    if (userError) {
      console.error("Error fetching project_user", userError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (!user && event_type === "user_signed_up") {
      if (!email) {
        return NextResponse.json(
          { error: "email is required for user_signed_up" },
          { status: 400 }
        );
      }

      const insertRes = await supabaseAdmin
        .from("project_users")
        .insert({
          project_id: projectId,
          external_user_id,
          email,
          trial_started_at: eventTime,
        })
        .select("*")
        .single();

      if (insertRes.error) {
        console.error("Error creating project_user", insertRes.error);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }

      user = insertRes.data;
    }

    if (!user && event_type !== "user_signed_up") {
      return NextResponse.json(
        { error: "Unknown user. Must send user_signed_up first." },
        { status: 400 }
      );
    }

    // For upgrades, mark upgraded_at on the user
    if (event_type === "user_upgraded" && user) {
      const updateRes = await supabaseAdmin
        .from("project_users")
        .update({ upgraded_at: eventTime })
        .eq("id", user.id);

      if (updateRes.error) {
        console.error("Error updating upgraded_at", updateRes.error);
      }
    }

    // Insert into events table
    const insertEventRes = await supabaseAdmin.from("events").insert({
      project_id: projectId,
      user_id: user!.id,
      event_type,
      created_at: eventTime,
      data: data ?? {},
    });

    if (insertEventRes.error) {
      console.error("Error inserting event", insertEventRes.error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Unexpected error in /api/events", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

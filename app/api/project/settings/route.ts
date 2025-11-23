import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const settingsSchema = z.object({
  app_url: z.string().url(),
  trial_length_days: z.number().int().min(1).max(365),
  inactivity_days_nudge1: z.number().int().min(1).max(365),
  inactivity_days_nudge2: z.number().int().min(1).max(365),
  inactivity_days_nudge3: z.number().int().min(1).max(365),
  automation_enabled: z.boolean(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId =
    searchParams.get("projectId") || process.env.DEFAULT_PROJECT_ID!;

  const { data, error } = await supabaseAdmin
    .from("trial_settings")
    .select("*")
    .eq("project_id", projectId)
    .single();

  if (error) {
    console.error("Error loading trial_settings", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId =
      searchParams.get("projectId") || process.env.DEFAULT_PROJECT_ID!;

    const json = await req.json();
    const parsed = settingsSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const payload = parsed.data;

    const { error } = await supabaseAdmin
      .from("trial_settings")
      .upsert({
        project_id: projectId,
        app_url: payload.app_url,
        trial_length_days: payload.trial_length_days,
        inactivity_days_nudge1: payload.inactivity_days_nudge1,
        inactivity_days_nudge2: payload.inactivity_days_nudge2,
        inactivity_days_nudge3: payload.inactivity_days_nudge3,
        automation_enabled: payload.automation_enabled,
      });

    if (error) {
      console.error("Error saving trial_settings", error);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error in POST /api/project/settings", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
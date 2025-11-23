/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const bodySchema = z.object({
  user_id: z.string().uuid(),
});

function generateApiKey() {
  return "tr_" + crypto.randomUUID().replace(/-/g, "").slice(0, 24);
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { user_id } = parsed.data;

    // 1) Try to find an existing project for this user
    const { data: existing, error: findError } = await supabaseAdmin
      .from("projects")
      .select("id, name, api_key")
      .eq("owner_user_id", user_id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (findError) {
      console.error("resolve-project find error", findError);
      return NextResponse.json(
        { error: "DB error", details: findError },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json({
        project_id: existing.id,
        name: existing.name,
        api_key: existing.api_key,
      });
    }

    // 2) If none exists, CREATE ONE automatically
    const api_key = generateApiKey();

    const { data: project, error: projectError } = await supabaseAdmin
      .from("projects")
      .insert({
        name: "My SaaS",
        owner_user_id: user_id,
        api_key,
      })
      .select("id, name, api_key")
      .single();

    if (projectError) {
      console.error("resolve-project create project error", projectError);
      return NextResponse.json(
        { error: "Error creating project", details: projectError },
        { status: 500 }
      );
    }

    // 3) Create default trial_settings (non-fatal if this fails)
    const { error: settingsError } = await supabaseAdmin
      .from("trial_settings")
      .insert({
        project_id: project.id,
        trial_length_days: 14,
        inactivity_days_nudge1: 2,
        inactivity_days_nudge2: 4,
        inactivity_days_nudge3: 7,
        app_url: "https://your-saas-app.com",
        automation_enabled: true,
      });

    if (settingsError) {
      console.error("resolve-project create settings error", settingsError);
      // still return success; project exists
    }

    return NextResponse.json({
      project_id: project.id,
      name: project.name,
      api_key: project.api_key,
    });
  } catch (err: any) {
    console.error("resolve-project fatal error", err);
    return NextResponse.json(
      { error: "Server error", details: String(err?.message || err) },
      { status: 500 }
    );
  }
}
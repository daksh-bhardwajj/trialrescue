/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { email, z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const bodySchema = z.object({
  user_id: z.string().uuid(),
  project_name: z.string().min(1),
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

    const { user_id, project_name } = parsed.data;
    const api_key = generateApiKey();

    // 1) Create project
    const { data: project, error: projectError } = await supabaseAdmin
      .from("projects")
      .insert({
        name: project_name,
        owner_email: email,
        owner_user_id: user_id,
        api_key,
      })
      .select("id, api_key")
      .single();

    if (projectError) {
      console.error("Error creating project", projectError);
      return NextResponse.json(
        { error: "Error creating project", details: projectError },
        { status: 500 }
      );
    }

    // 2) Create default trial_settings (non-fatal if this fails)
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
      console.error("Error creating trial_settings", settingsError);
      return NextResponse.json(
        {
          warning: "Project created but failed to create trial_settings",
          details: settingsError,
          project_id: project.id,
          api_key: project.api_key,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      project_id: project.id,
      api_key: project.api_key,
    });
  } catch (err: any) {
    console.error("bootstrap-project fatal error", err);
    return NextResponse.json(
      { error: "Server error", details: String(err?.message || err) },
      { status: 500 }
    );
  }
}
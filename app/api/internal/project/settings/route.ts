/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/internal/project/settings/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "Missing projectId" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("trial_settings")
      .select(
        `
        project_id,
        trial_length_days,
        inactivity_days_nudge1,
        inactivity_days_nudge2,
        inactivity_days_nudge3,
        app_url,
        automation_enabled,
        product_name,
        support_email
      `
      )
      .eq("project_id", projectId)
      .single();

    if (error || !data) {
      console.error("settings GET error", error);
      return NextResponse.json(
        { error: "Settings not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("settings GET fatal", err);
    return NextResponse.json(
      { error: "Server error", details: String(err) },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const json = await req.json().catch(() => null);
    if (!json || !json.project_id) {
      return NextResponse.json(
        { error: "Missing project_id in body" },
        { status: 400 }
      );
    }

    const {
      project_id,
      trial_length_days,
      inactivity_days_nudge1,
      inactivity_days_nudge2,
      inactivity_days_nudge3,
      app_url,
      automation_enabled,
      product_name,
      support_email,
    } = json;

    const updatePayload: Record<string, any> = {};

    if (typeof trial_length_days === "number")
      updatePayload.trial_length_days = trial_length_days;
    if (typeof inactivity_days_nudge1 === "number")
      updatePayload.inactivity_days_nudge1 = inactivity_days_nudge1;
    if (typeof inactivity_days_nudge2 === "number")
      updatePayload.inactivity_days_nudge2 = inactivity_days_nudge2;
    if (typeof inactivity_days_nudge3 === "number")
      updatePayload.inactivity_days_nudge3 = inactivity_days_nudge3;

    if (typeof app_url === "string") updatePayload.app_url = app_url;
    if (typeof product_name === "string")
      updatePayload.product_name = product_name;
    if (typeof support_email === "string")
      updatePayload.support_email = support_email;

    if (typeof automation_enabled === "boolean")
      updatePayload.automation_enabled = automation_enabled;

    updatePayload.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("trial_settings")
      .update(updatePayload)
      .eq("project_id", project_id)
      .select("*")
      .single();

    if (error) {
      console.error("settings PATCH error", error);
      return NextResponse.json(
        { error: "Failed to update settings", details: error },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("settings PATCH fatal", err);
    return NextResponse.json(
      { error: "Server error", details: String(err) },
      { status: 500 }
    );
  }
}

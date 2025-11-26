/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/internal/project/billing/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// GET /api/internal/project/billing?projectId=...
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
      .from("projects")
      .select("id, billing_status, billing_plan, billing_updated_at")
      .eq("id", projectId)
      .single();

    if (error || !data) {
      console.error("billing GET error", error);
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("billing GET fatal", err);
    return NextResponse.json(
      { error: "Server error", details: String(err) },
      { status: 500 }
    );
  }
}

// PATCH /api/internal/project/billing
// body: { project_id, billing_status, billing_plan }
export async function PATCH(req: NextRequest) {
  try {
    const json = await req.json().catch(() => null);
    if (!json || !json.project_id) {
      return NextResponse.json(
        { error: "Missing project_id in body" },
        { status: 400 }
      );
    }

    const { project_id, billing_status, billing_plan } = json;

    const updatePayload: Record<string, any> = {};

    if (typeof billing_status === "string") {
      updatePayload.billing_status = billing_status;
    }
    if (typeof billing_plan === "string") {
      updatePayload.billing_plan = billing_plan;
    }

    updatePayload.billing_updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("projects")
      .update(updatePayload)
      .eq("id", project_id)
      .select("id, billing_status, billing_plan, billing_updated_at")
      .single();

    if (error) {
      console.error("billing PATCH error", error);
      return NextResponse.json(
        { error: "Failed to update billing", details: error },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("billing PATCH fatal", err);
    return NextResponse.json(
      { error: "Server error", details: String(err) },
      { status: 500 }
    );
  }
}

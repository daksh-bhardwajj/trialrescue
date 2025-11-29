/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/internal/project/last-event/route.ts

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

    const { data: rows, error } = await supabaseAdmin
      .from("project_users")
      .select("trial_started_at, last_activity_at, upgraded_at")
      .eq("project_id", projectId);

    if (error) {
      console.error("last-event: error loading project_users", error);
      return NextResponse.json(
        { error: "Failed to load events" },
        { status: 500 }
      );
    }

    if (!rows || rows.length === 0) {
      return NextResponse.json({ last_event_at: null });
    }

    let latest: string | null = null;

    for (const row of rows) {
      const candidates = [
        row.trial_started_at,
        row.last_activity_at,
        row.upgraded_at,
      ].filter(Boolean) as string[];

      for (const iso of candidates) {
        if (!latest || new Date(iso).getTime() > new Date(latest).getTime()) {
          latest = iso;
        }
      }
    }

    return NextResponse.json({ last_event_at: latest });
  } catch (err: any) {
    console.error("last-event: fatal error", err);
    return NextResponse.json(
      { error: "Server error", details: String(err) },
      { status: 500 }
    );
  }
}

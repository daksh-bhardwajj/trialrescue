/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.project_id || !body.email) {
      return NextResponse.json(
        { error: "Missing project_id or email" },
        { status: 400 }
      );
    }

    const { project_id, email } = body as {
      project_id: string;
      email: string;
    };

    // Only set it if it's currently NULL
    const { data: project, error } = await supabaseAdmin
      .from("projects")
      .select("id, owner_email")
      .eq("id", project_id)
      .maybeSingle();

    if (error) {
      console.error("owner-email lookup error", error);
      return NextResponse.json(
        { error: "Lookup failed" },
        { status: 500 }
      );
    }

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    if (project.owner_email) {
      // already set, nothing to do
      return NextResponse.json({ ok: true, alreadySet: true });
    }

    const { error: updateError } = await supabaseAdmin
      .from("projects")
      .update({
        owner_email: email,
      })
      .eq("id", project_id);

    if (updateError) {
      console.error("owner-email update error", updateError);
      return NextResponse.json(
        { error: "Update failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, updated: true });
  } catch (err: any) {
    console.error("owner-email fatal", err);
    return NextResponse.json(
      { error: "Server error", details: String(err) },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

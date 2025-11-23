/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId =
      searchParams.get("projectId") || process.env.DEFAULT_PROJECT_ID!;

    const now = new Date();
    const since = new Date();
    since.setDate(now.getDate() - 30);
    const sinceIso = since.toISOString();

    const trialsRes = await supabaseAdmin
      .from("project_users")
      .select("id, upgraded_at, trial_started_at")
      .eq("project_id", projectId)
      .gte("trial_started_at", sinceIso);

    if (trialsRes.error) {
      console.error("Error loading project_users", trialsRes.error);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    const users = trialsRes.data ?? [];
    const trialsLast30 = users.length;

    const emailLogsRes = await supabaseAdmin
      .from("email_logs")
      .select("user_id, sent_at")
      .eq("project_id", projectId);

    if (emailLogsRes.error) {
      console.error("Error loading email_logs", emailLogsRes.error);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    const emailLogs = emailLogsRes.data ?? [];
    const nudgedUserIds = new Set<string>(
      emailLogs.map((log: any) => String(log.user_id))
    );
    const nudgedUsersCount = nudgedUserIds.size;

    let upgradesFromRescued = 0;

    for (const user of users) {
      if (!user.upgraded_at) continue;

      const upgradedAt = new Date(user.upgraded_at);

      const hadEmailBeforeUpgrade = emailLogs.some((log: any) => {
        return (
          String(log.user_id) === String(user.id) &&
          new Date(log.sent_at) <= upgradedAt
        );
      });

      if (hadEmailBeforeUpgrade) {
        upgradesFromRescued++;
      }
    }

    return NextResponse.json({
      trials_last_30: trialsLast30,
      nudged_users: nudgedUsersCount,
      upgrades_from_rescued: upgradesFromRescued,
    });
  } catch (err) {
    console.error("Unexpected error in /api/dashboard/summary", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
// app/api/cron/sweep/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { Resend } from "resend";
import {
  getNudgeBodyHtml,
  getNudgeBodyText,
  getNudgeSubject,
  NudgeKind,
} from "@/lib/emailTemplates";

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn("RESEND_API_KEY is not set. Cron emails will fail.");
}

const resend = resendApiKey ? new Resend(resendApiKey) : null;

function diffDays(a: Date, b: Date): number {
  const ms = a.getTime() - b.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export async function GET(_req: NextRequest) {
  if (!resend) {
    console.error("Cron: RESEND client not configured");
    return NextResponse.json(
      { error: "Resend not configured" },
      { status: 500 }
    );
  }

  try {
    // 1) Load all projects that have trial settings and automation enabled
    const { data: settingsRows, error: settingsError } = await supabaseAdmin
      .from("trial_settings")
      .select("*");

    if (settingsError) {
      console.error("Cron: error loading trial_settings", settingsError);
      return NextResponse.json(
        { error: "Error loading trial settings" },
        { status: 500 }
      );
    }

    if (!settingsRows || settingsRows.length === 0) {
      return NextResponse.json({
        ok: true,
        total_sent: 0,
        reason: "no projects with settings",
      });
    }

    let totalSent = 0;
    const perProject: { project_id: string; sent: number }[] = [];

    // 2) Iterate each project and run sweep
    for (const settings of settingsRows) {
      const projectId = String(settings.project_id);
      if (!settings.automation_enabled) {
        perProject.push({ project_id: projectId, sent: 0 });
        continue;
      }

      const productName: string = settings.product_name || "your product";
      const supportEmail: string =
        settings.support_email || "founder@example.com";
      const appUrl: string =
        settings.app_url || "https://your-saas-app.com/dashboard";

      // Load users for THIS project
      const { data: users, error: usersError } = await supabaseAdmin
        .from("project_users")
        .select(
          "id, project_id, email, trial_started_at, last_activity_at, upgraded_at, unsubscribed"
        )
        .eq("project_id", projectId);

      if (usersError) {
        console.error(
          `Cron: error loading project_users for project ${projectId}`,
          usersError
        );
        perProject.push({ project_id: projectId, sent: 0 });
        continue;
      }

      if (!users || users.length === 0) {
        perProject.push({ project_id: projectId, sent: 0 });
        continue;
      }

      // Load previous email logs for THIS project
      const { data: logs, error: logsError } = await supabaseAdmin
        .from("email_logs")
        .select("user_id, email_type")
        .eq("project_id", projectId);

      if (logsError) {
        console.error(
          `Cron: error loading email_logs for project ${projectId}`,
          logsError
        );
        perProject.push({ project_id: projectId, sent: 0 });
        continue;
      }

      const sentByUser = new Map<
        string,
        Set<"nudge1" | "nudge2" | "nudge3">
      >();

      (logs || []).forEach((log: any) => {
        const uid = String(log.user_id);
        if (!sentByUser.has(uid)) sentByUser.set(uid, new Set());
        (sentByUser.get(uid) as Set<any>).add(log.email_type);
      });

      const now = new Date();
      const n1 = settings.inactivity_days_nudge1;
      const n2 = settings.inactivity_days_nudge2;
      const n3 = settings.inactivity_days_nudge3;

      const candidates: {
        userId: string;
        email: string;
        nudge: NudgeKind;
      }[] = [];

      // Determine which users in THIS project should get which nudge
      for (const user of users) {
        if (!user.email) continue;
        if (user.unsubscribed) continue;
        if (user.upgraded_at) continue;

        const lastActivityIso =
          user.last_activity_at || user.trial_started_at || null;
        if (!lastActivityIso) continue;

        const lastActivity = new Date(lastActivityIso);
        const daysInactive = diffDays(now, lastActivity);

        const alreadySent = sentByUser.get(String(user.id)) || new Set();

        let nudgeToSend: NudgeKind | null = null;
        if (daysInactive >= n3 && !alreadySent.has("nudge3")) {
          nudgeToSend = "nudge3";
        } else if (daysInactive >= n2 && !alreadySent.has("nudge2")) {
          nudgeToSend = "nudge2";
        } else if (daysInactive >= n1 && !alreadySent.has("nudge1")) {
          nudgeToSend = "nudge1";
        }

        if (!nudgeToSend) continue;

        candidates.push({
          userId: String(user.id),
          email: user.email,
          nudge: nudgeToSend,
        });
      }

      if (candidates.length === 0) {
        perProject.push({ project_id: projectId, sent: 0 });
        continue;
      }

      let sentForProject = 0;

      // Send + log for this project
      for (const item of candidates) {
        const subject = getNudgeSubject(item.nudge, productName);
        const html = getNudgeBodyHtml(item.nudge, productName).replace(
          "{{APP_URL}}",
          appUrl
        );
        const text = getNudgeBodyText(item.nudge, productName).replace(
          "{{APP_URL}}",
          appUrl
        );

        try {
          const emailRes = await resend.emails.send({
            from: `TrialRescue for ${productName} <notifications@trialrescue.com>`,
            to: item.email,
            subject,
            html,
            text,
            // @ts-ignore
            reply_to: supportEmail,
          });

          const providerMessageId =
            (emailRes as any)?.data?.id ||
            (emailRes as any)?.id ||
            null;

          const { error: logError } = await supabaseAdmin
            .from("email_logs")
            .insert({
              project_id: projectId,
              user_id: item.userId,
              email_type: item.nudge,
              provider_message_id: providerMessageId,
            });

          if (logError) {
            console.error(
              `Cron: error logging email for project ${projectId}`,
              logError
            );
          } else {
            sentForProject++;
            totalSent++;
          }
        } catch (err) {
          console.error(
            `Cron: error sending email for project ${projectId}`,
            err
          );
        }
      }

      perProject.push({ project_id: projectId, sent: sentForProject });
    }

    return NextResponse.json({ ok: true, total_sent: totalSent, per_project: perProject });
  } catch (err) {
    console.error("Cron: fatal error", err);
    return NextResponse.json(
      { error: "Server error", details: String(err) },
      { status: 500 }
    );
  }
}

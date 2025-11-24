/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
const DEFAULT_PROJECT_ID = process.env.DEFAULT_PROJECT_ID;

if (!resendApiKey) {
  console.warn("RESEND_API_KEY is not set. Cron emails will fail.");
}

if (!DEFAULT_PROJECT_ID) {
  console.warn(
    "DEFAULT_PROJECT_ID is not set. Cron sweep will not know which project to process."
  );
}

const resend = resendApiKey ? new Resend(resendApiKey) : null;

function diffDays(a: Date, b: Date): number {
  const ms = a.getTime() - b.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export async function GET(_req: NextRequest) {
  try {
    if (!DEFAULT_PROJECT_ID) {
      return NextResponse.json(
        { error: "Missing DEFAULT_PROJECT_ID env" },
        { status: 500 }
      );
    }

    // 1) Load settings for this project (includes product_name + support_email)
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from("trial_settings")
      .select("*")
      .eq("project_id", DEFAULT_PROJECT_ID)
      .single();

    if (settingsError || !settings) {
      console.error("Cron: no settings for project", settingsError);
      return NextResponse.json(
        { error: "No settings for project" },
        { status: 500 }
      );
    }

    const productName: string = settings.product_name || "your product";
    const supportEmail: string =
      settings.support_email || "founder@example.com";
    const appUrl: string =
      settings.app_url || "https://your-saas-app.com/dashboard";

    if (!resend) {
      console.error("Cron: RESEND client not configured");
      return NextResponse.json(
        { error: "Resend not configured" },
        { status: 500 }
      );
    }

    // 2) Load users for this project
    const { data: users, error: usersError } = await supabaseAdmin
      .from("project_users")
      .select(
        "id, project_id, email, trial_started_at, last_activity_at, upgraded_at, unsubscribed"
      )
      .eq("project_id", DEFAULT_PROJECT_ID);

    if (usersError) {
      console.error("Cron: error loading project_users", usersError);
      return NextResponse.json(
        { error: "Error loading users" },
        { status: 500 }
      );
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ ok: true, sent: 0, reason: "no users" });
    }

    // 3) Load previous email logs for this project
    const { data: logs, error: logsError } = await supabaseAdmin
      .from("email_logs")
      .select("user_id, email_type")
      .eq("project_id", DEFAULT_PROJECT_ID);

    if (logsError) {
      console.error("Cron: error loading email_logs", logsError);
      return NextResponse.json(
        { error: "Error loading email logs" },
        { status: 500 }
      );
    }

    const sentByUser = new Map<
      string,
      Set<"nudge1" | "nudge2" | "nudge3">
    >();

    (logs || []).forEach((log: any) => {
      const uid = String(log.user_id);
      if (!sentByUser.has(uid)) sentByUser.set(uid, new Set());
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

      // Only queue if automation is enabled
      if (!settings.automation_enabled) continue;

      candidates.push({
        userId: String(user.id),
        email: user.email,
        nudge: nudgeToSend,
      });
    }

    if (candidates.length === 0) {
      return NextResponse.json({
        ok: true,
        sent: 0,
        reason: "no eligible users",
      });
    }

    let sentCount = 0;

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
          // @ts-ignore - reply_to is valid in Resend API
          reply_to: supportEmail,
        });

        const providerMessageId =
          (emailRes as any)?.data?.id ||
          (emailRes as any)?.id ||
          null;

        const { error: logError } = await supabaseAdmin
          .from("email_logs")
          .insert({
            project_id: DEFAULT_PROJECT_ID,
            user_id: item.userId,
            email_type: item.nudge,
            provider_message_id: providerMessageId,
          });

        if (logError) {
          console.error("Cron: error logging email", logError);
        } else {
          sentCount++;
        }
      } catch (err) {
        console.error("Cron: error sending email", err);
      }
    }

    return NextResponse.json({ ok: true, sent: sentCount });
  } catch (err) {
    console.error("Cron: fatal error", err);
    return NextResponse.json(
      { error: "Server error", details: String(err) },
      { status: 500 }
    );
  }
}
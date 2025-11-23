/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { resend } from "@/lib/resendClient";
import { getNudgeBodyHtml, getNudgeBodyText, getNudgeSubject, NudgeType } from "@/lib/emailTemplates";

const DEFAULT_PROJECT_ID = process.env.DEFAULT_PROJECT_ID!;
const FROM_EMAIL = "onboarding@resend.dev"; // safe and accepted sender for testing

// Helper to add days
function daysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}

export async function GET(req: NextRequest) {
  try {
    const projectId = DEFAULT_PROJECT_ID;

    const { data: settings, error: settingsError } = await supabaseAdmin
  .from("trial_settings")
  .select("*")
  .eq("project_id", projectId)
  .single();

if (settingsError || !settings) {
  console.error("No trial_settings found for project", settingsError);
  return NextResponse.json({ error: "No settings" }, { status: 500 });
}

if (!settings.automation_enabled) {
  // Automation is paused – do nothing
  return NextResponse.json({ ok: true, sent: 0, message: "Automation disabled" });
}

// convert days from settings
const nudge1Threshold = daysAgo(settings.inactivity_days_nudge1);
const nudge2Threshold = daysAgo(settings.inactivity_days_nudge2);
const nudge3Threshold = daysAgo(settings.inactivity_days_nudge3);

    // 1) Load project users who are in trial (not upgraded, not unsubscribed)
    // And who signed up before latest nudge threshold
    const { data: users, error: usersError } = await supabaseAdmin
      .from("project_users")
      .select("id, email, trial_started_at, upgraded_at, unsubscribed")
      .eq("project_id", projectId)
      .is("upgraded_at", null)
      .eq("unsubscribed", false)
      .lte("trial_started_at", nudge1Threshold); // trial exists for at least 2 days

    if (usersError) {
      console.error("Error loading users for cron", usersError);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ ok: true, sent: 0, message: "No eligible users" });
    }

    let sentCount = 0;

    for (const user of users) {
      // Find latest activity event, and all email nudges already sent
      const { data: events, error: eventsError } = await supabaseAdmin
        .from("events")
        .select("event_type, created_at")
        .eq("project_id", projectId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (eventsError) {
        console.error("Error loading events for user", user.id, eventsError);
        continue;
      }

      const lastActivity = events?.find((e) => e.event_type === "user_activity");
      const lastActivityAt = lastActivity?.created_at ?? user.trial_started_at;

      const { data: emailLogs, error: emailError } = await supabaseAdmin
        .from("email_logs")
        .select("email_type, sent_at")
        .eq("project_id", projectId)
        .eq("user_id", user.id);

      if (emailError) {
        console.error("Error loading email logs for user", user.id, emailError);
        continue;
      }

      const alreadySent = new Set<string>(emailLogs?.map((e) => e.email_type) ?? []);

      const lastActivityIso = new Date(lastActivityAt).toISOString();

      let nudgeToSend: NudgeType | null = null;

      if (
        !alreadySent.has("nudge1") &&
        lastActivityIso <= nudge1Threshold
      ) {
        nudgeToSend = "nudge1";
      } else if (
        !alreadySent.has("nudge2") &&
        lastActivityIso <= nudge2Threshold
      ) {
        nudgeToSend = "nudge2";
      } else if (
        !alreadySent.has("nudge3") &&
        lastActivityIso <= nudge3Threshold
      ) {
        nudgeToSend = "nudge3";
      }

      if (!nudgeToSend) {
        continue;
      }

      const subject = getNudgeSubject(nudgeToSend);
      const appUrl = settings.app_url || "https://your-saas-app.com";

      const html = getNudgeBodyHtml(nudgeToSend).replace("{{APP_URL}}", appUrl);
      const text = getNudgeBodyText(nudgeToSend).replace("{{APP_URL}}", appUrl);


      try {
        const emailRes = await resend.emails.send({
          from: `TrialRescue <${FROM_EMAIL}>`,
          to: user.email,
          subject,
          html,
          text,
        });

        const providerMessageId =
          (emailRes as any)?.data?.id || (emailRes as any)?.id || null;

        const { error: logError } = await supabaseAdmin.from("email_logs").insert({
          project_id: projectId,
          user_id: user.id,
          email_type: nudgeToSend,
          provider_message_id: providerMessageId,
        });

        if (logError) {
          console.error("Error logging email", logError);
        } else {
          sentCount++;
        }
      } catch (err) {
        console.error("Error sending email for user", user.id, err);
        continue;
      }
    }

    return NextResponse.json({ ok: true, sent: sentCount });
  } catch (err) {
    console.error("Unexpected error in cron/sweep", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

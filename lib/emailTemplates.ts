// lib/emailTemplates.ts

export type NudgeType = "nudge1" | "nudge2" | "nudge3";

export function getNudgeSubject(nudge: NudgeType) {
  switch (nudge) {
    case "nudge1":
      return "Still want to try your account?";
    case "nudge2":
      return "Quick reminder before your trial goes cold";
    case "nudge3":
      return "Last chance before we close your trial";
    default:
      return "Checking in on your trial";
  }
}

export function getNudgeBodyHtml(nudge: NudgeType) {
  const intro =
    nudge === "nudge1"
      ? "You signed up recently but haven’t really had a chance to try things out yet."
      : nudge === "nudge2"
      ? "We’ve noticed your account has been quiet — most people who see value run at least one or two key actions."
      : "We’re about to close out your trial. If you still want to experiment, this is your last nudge.";

  return `
  <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #020617; color: #e5e7eb; padding: 24px;">
    <div style="max-width: 520px; margin: 0 auto; background: radial-gradient(circle at top left, #0f172a, #020617); border-radius: 16px; border: 1px solid #1f2937; padding: 24px;">
      <h1 style="font-size: 20px; margin-bottom: 8px; color: #f9fafb;">Your trial is idling</h1>
      <p style="font-size: 14px; line-height: 1.6; color: #9ca3af; margin-bottom: 16px;">
        ${intro}
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #9ca3af; margin-bottom: 16px;">
        Log back in, run one meaningful action, and see if this is worth keeping before you forget about it completely.
      </p>
      <a href="{{APP_URL}}" style="display: inline-block; font-size: 14px; padding: 8px 16px; border-radius: 9999px; background-color: #06b6d4; color: #020617; text-decoration: none; font-weight: 600;">
        Open my trial
      </a>
    </div>
  </div>
  `;
}

export function getNudgeBodyText(nudge: NudgeType) {
  const intro =
    nudge === "nudge1"
      ? "You signed up recently but haven’t really had a chance to try things out yet."
      : nudge === "nudge2"
      ? "We’ve noticed your account has been quiet — most people who see value run at least one or two key actions."
      : "We’re about to close out your trial. If you still want to experiment, this is your last nudge.";

  return `
Your trial is idling.

${intro}

Log back in, run one meaningful action, and see if this is worth keeping before you forget about it completely.

Open my trial: {{APP_URL}}
`;
}

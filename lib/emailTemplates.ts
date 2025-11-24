// lib/emailTemplates.ts

export type NudgeKind = "nudge1" | "nudge2" | "nudge3";

export function getNudgeSubject(nudge: NudgeKind, productName: string) {
  const name = productName || "your product";

  switch (nudge) {
    case "nudge1":
      return `Still on your ${name} trial?`;
    case "nudge2":
      return `Your ${name} trial is idling`;
    case "nudge3":
      return `Before your ${name} trial fully goes cold…`;
    default:
      return `${name} trial reminder`;
  }
}

export function getNudgeBodyHtml(
  nudge: NudgeKind,
  productName: string
): string {
  const name = productName || "your product";

  let intro: string;
  if (nudge === "nudge1") {
    intro = `You started a trial with <strong>${name}</strong>, but you haven’t really used it yet.`;
  } else if (nudge === "nudge2") {
    intro = `Your <strong>${name}</strong> trial is sitting there without much action.`;
  } else {
    intro = `Your trial with <strong>${name}</strong> is about to fade out completely.`;
  }

  return `
  <div style="background-color: #020617; padding: 24px; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif; color: #e5e7eb;">
    <div style="max-width: 520px; margin: 0 auto; border-radius: 18px; border: 1px solid #1f2937; background: radial-gradient(circle at top left, #0f172a 0, #020617 55%); padding: 20px 20px 24px;">
      <div style="font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #64748b; margin-bottom: 8px;">
        TrialRescue · for ${name}
      </div>
      <h1 style="font-size: 18px; line-height: 1.4; color: #f9fafb; margin: 0 0 10px;">
        Don’t let your ${name} trial go cold
      </h1>
      <p style="font-size: 14px; line-height: 1.7; color: #cbd5f5; margin: 0 0 10px;">
        ${intro}
      </p>
      <p style="font-size: 13px; line-height: 1.7; color: #9ca3af; margin: 0 0 12px;">
        Most trials quietly die because people get busy, not because the product is bad. 
        Take 5 minutes to jump back in, run one meaningful action, and see if ${name} is worth keeping.
      </p>
      <p style="font-size: 13px; line-height: 1.7; color: #9ca3af; margin: 0 0 20px;">
        When you’re ready, click below to go straight back into your ${name} workspace.
      </p>

      <a href="{{APP_URL}}" style="
        display: inline-block;
        font-size: 14px;
        padding: 9px 18px;
        border-radius: 9999px;
        background-color: #06b6d4;
        color: #020617;
        text-decoration: none;
        font-weight: 600;
      ">
        Open my ${name} trial
      </a>

      <p style="font-size: 11px; line-height: 1.7; color: #6b7280; margin-top: 24px;">
        This reminder was sent automatically on behalf of <strong>${name}</strong> 
        because you started a trial and haven’t been active recently.
      </p>
    </div>
  </div>
  `;
}

export function getNudgeBodyText(
  nudge: NudgeKind,
  productName: string
): string {
  const name = productName || "your product";

  let intro: string;
  if (nudge === "nudge1") {
    intro = `You started a trial with ${name}, but you haven’t really used it yet.`;
  } else if (nudge === "nudge2") {
    intro = `Your ${name} trial is sitting there without much action.`;
  } else {
    intro = `Your trial with ${name} is about to fade out completely.`;
  }

  return `
Don’t let your ${name} trial go cold.

${intro}

Most trials quietly die because people get busy, not because the product is bad.
Take 5 minutes to jump back in, run one meaningful action, and see if ${name} is worth keeping.

Open my trial: {{APP_URL}}

This reminder was sent automatically on behalf of ${name} because you started a trial and haven’t been active recently.
`;
}
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
<div style="background-color: #000000; padding: 48px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e4e4e7;">
    
    <div style="
      max-width: 480px; 
      margin: 0 auto; 
      background-color: #09090b; 
      border: 1px solid #27272a; 
      border-radius: 24px; 
      padding: 40px 32px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.5);
    ">
      
      <div style="margin-bottom: 24px;">
        <span style="
          font-size: 10px; 
          font-weight: 700; 
          letter-spacing: 0.2em; 
          text-transform: uppercase; 
          color: #71717a; 
          border: 1px solid #27272a; 
          padding: 6px 12px; 
          border-radius: 100px;
          background-color: #18181b;
        ">
          TrialRescue &middot; ${name}
        </span>
      </div>

      <h1 style="
        font-size: 24px; 
        line-height: 1.3; 
        font-weight: 700; 
        color: #ffffff; 
        margin: 0 0 16px;
        letter-spacing: -0.02em;
      ">
        Don’t let your ${name}<br/>trial go cold.
      </h1>

      <p style="
        font-size: 15px; 
        line-height: 1.6; 
        color: #d4d4d8; 
        margin: 0 0 20px;
      ">
        ${intro}
      </p>

      <p style="
        font-size: 14px; 
        line-height: 1.6; 
        color: #a1a1aa; 
        margin: 0 0 32px;
      ">
        Most trials quietly die because people get busy, not because the product lacks value. Take 5 minutes to jump back in and run one meaningful action.
      </p>

      <div style="margin-bottom: 32px;">
        <a href="{{APP_URL}}" style="
          display: inline-block;
          background-color: #ffffff;
          color: #000000;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          padding: 14px 28px;
          border-radius: 100px;
          text-align: center;
          box-shadow: 0 0 15px rgba(255,255,255,0.15);
        ">
          Open my ${name} trial &rarr;
        </a>
      </div>

      <div style="height: 1px; background-color: #27272a; margin-bottom: 24px;"></div>

      <p style="
        font-size: 11px; 
        line-height: 1.5; 
        color: #52525b; 
        margin: 0;
      ">
        This automated reminder was sent on behalf of <strong style="color: #a1a1aa;">${name}</strong> via TrialRescue because your trial activity has paused.
      </p>
      
    </div>
    
    <div style="text-align: center; margin-top: 24px;">
       <p style="font-size: 10px; color: #3f3f46; letter-spacing: 0.05em;">
         POWERED BY TRIALRESCUE
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
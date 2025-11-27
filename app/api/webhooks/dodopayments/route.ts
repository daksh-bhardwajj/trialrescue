/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type DodoWebhookEvent = {
  type: string; // e.g. "payment.succeeded", "subscription.active"
  data: any;
};

const WEBHOOK_SECRET = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;

function verifySignature(rawBody: string, req: NextRequest): boolean {
  if (!WEBHOOK_SECRET) {
    console.error("Missing DODO_PAYMENTS_WEBHOOK_SECRET");
    return false;
  }

  const signature = req.headers.get("webhook-signature");
  const timestamp = req.headers.get("webhook-timestamp");
  const id = req.headers.get("webhook-id");

  if (!signature || !timestamp || !id) {
    console.error("Missing webhook headers");
    return false;
  }

  // Dodo uses HMAC SHA256 over payload + timestamp. Exact format in docs:
  // "sign payload and timestamp with HMAC-SHA256 and compare against webhook-signature". :contentReference[oaicite:4]{index=4}
  // We'll use "<timestamp>.<body>" which is the common pattern.
  const toSign = `${timestamp}.${rawBody}`;

  const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET);
  hmac.update(toSign, "utf8");
  const digest = hmac.digest("hex");

  try {
    const sigBuf = Buffer.from(signature, "hex");
    const digestBuf = Buffer.from(digest, "hex");
    if (sigBuf.length !== digestBuf.length) {
      return false;
    }
    return crypto.timingSafeEqual(sigBuf, digestBuf);
  } catch (err) {
    console.error("Error comparing signatures", err);
    return false;
  }
}

async function handleActivation(event: DodoWebhookEvent) {
  // TODO: adjust these paths based on actual payload shape from Dodo
  // In many examples, customer email lives on data.customer.email or data.customer_email. :contentReference[oaicite:5]{index=5}
  const data = event.data || {};
  const customerEmail =
    data.customer?.email || data.customer_email || data.email || null;

  if (!customerEmail) {
    console.error("No customer email found in webhook payload");
    return;
  }

  // 🔴 IMPORTANT:
  // This assumes your `projects` table has some way to link to that email.
  // Adjust the column (owner_email / created_by_email / whatever you actually use).
  const { data: project, error } = await supabaseAdmin
    .from("projects")
    .select("id, billing_status, billing_plan")
    .eq("owner_email", customerEmail) // <-- CHANGE IF YOUR COLUMN NAME IS DIFFERENT
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error looking up project by email", error);
    return;
  }

  if (!project) {
    console.error("No project found for email", customerEmail);
    return;
  }

  const { error: updateError } = await supabaseAdmin
    .from("projects")
    .update({
      billing_status: "active",
      billing_plan: "early_bird_19",
      billing_updated_at: new Date().toISOString(),
    })
    .eq("id", project.id);

  if (updateError) {
    console.error("Error updating billing status", updateError);
  } else {
    console.log(
      `Activated billing for project ${project.id} (${customerEmail}) via webhook`
    );
  }
}

export async function POST(req: NextRequest) {
  let rawBody: string;

  try {
    // We need the raw body string for signature verification
    rawBody = await req.text();
  } catch (err) {
    console.error("Failed to read raw body", err);
    return NextResponse.json(
      { error: "Invalid body" },
      { status: 400 }
    );
  }

  if (!verifySignature(rawBody, req)) {
    console.error("Invalid webhook signature");
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  let event: DodoWebhookEvent;
  try {
    event = JSON.parse(rawBody);
  } catch (err) {
    console.error("Failed to parse webhook JSON", err);
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 }
    );
  }

  console.log("Received Dodo webhook", event.type);

  // 🔍 For now, just handle "success" events that indicate an active sub/payment.
  // Check your Dodo dashboard for the exact event type names you get for your plan.
  const successfulTypes = [
    "payment.succeeded",
    "payment.completed",
    "subscription.created",
    "subscription.active",
    "subscription.renewed",
  ];

  if (successfulTypes.includes(event.type)) {
    await handleActivation(event);
  }

  // You might later handle "subscription.cancelled" etc. to set billing_status = 'cancelled'
  return NextResponse.json({ received: true });
}

// Reject other verbs
export function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

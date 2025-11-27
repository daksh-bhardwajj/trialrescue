/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type DodoWebhookEvent = {
  type: string; // e.g. "payment.completed", "subscription.created"
  data: any;
};

const WEBHOOK_SECRET = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;

function verifySignature(rawBody: string, req: NextRequest): boolean {
  if (!WEBHOOK_SECRET) {
    console.error("Missing DODO_PAYMENTS_WEBHOOK_SECRET");
    return false;
  }

  const id = req.headers.get("webhook-id");
  const timestamp = req.headers.get("webhook-timestamp");
  const signature = req.headers.get("webhook-signature");

  if (!id || !timestamp || !signature) {
    console.error("Missing webhook headers");
    return false;
  }

  // Standard Webhooks format: "<id>.<timestamp>.<payload>"
  // Dodo docs: use HMAC-SHA256 over id.timestamp.payload :contentReference[oaicite:1]{index=1}
  const message = `${id}.${timestamp}.${rawBody}`;

  const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET);
  hmac.update(message, "utf8");
  const expected = hmac.digest("hex");

  try {
    const sigBuf = Buffer.from(signature, "hex");
    const expBuf = Buffer.from(expected, "hex");
    if (sigBuf.length !== expBuf.length) return false;
    return crypto.timingSafeEqual(sigBuf, expBuf);
  } catch (err) {
    console.error("Error comparing signatures", err);
    return false;
  }
}

// activate a project from a Dodo event
async function handleActivation(event: DodoWebhookEvent) {
  const payload = event.data || event;

  // Payment payload example has customer.email :contentReference[oaicite:2]{index=2}
  const customerEmail =
    payload?.customer?.email ||
    payload?.data?.customer?.email ||
    payload?.billing?.email ||
    payload?.email ||
    null;

  console.log("Webhook customerEmail:", customerEmail);

  if (!customerEmail) {
    console.error("No customer email found in webhook payload");
    return;
  }

  // IMPORTANT: make sure your projects table has owner_email populated
  const { data: project, error } = await supabaseAdmin
    .from("projects")
    .select("id, billing_status, billing_plan")
    .eq("owner_email", customerEmail) // <- requires owner_email column
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
    rawBody = await req.text(); // raw string body
  } catch (err) {
    console.error("Failed to read raw body", err);
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  console.log("Received Dodo webhook raw:", rawBody);

  if (!verifySignature(rawBody, req)) {
    console.error("Invalid webhook signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: DodoWebhookEvent;
  try {
    event = JSON.parse(rawBody);
  } catch (err) {
    console.error("Failed to parse webhook JSON", err);
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  console.log("Dodo webhook event type:", event.type);

  const successfulTypes = [
    "payment.completed",
    "payment.succeeded",
    "subscription.created",
    "subscription.active",
    "subscription.renewed",
  ];

  if (successfulTypes.includes(event.type)) {
    await handleActivation(event);
  }

  return NextResponse.json({ received: true });
}

export function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

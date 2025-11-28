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
    console.error("DODO_PAYMENTS_WEBHOOK_SECRET is not set");
    return false;
  }

  const id = req.headers.get("webhook-id");
  const timestamp = req.headers.get("webhook-timestamp");
  const signatureHeader = req.headers.get("webhook-signature");

  if (!id || !timestamp || !signatureHeader) {
    console.error("Missing required webhook headers");
    return false;
  }

  // 1. Prepare the Secret Key
  // Dodo/Svix secrets start with "whsec_" and are Base64 encoded.
  // We must remove the prefix and decode the string to get the actual byte key.
  const secretKeyString = WEBHOOK_SECRET.startsWith("whsec_")
    ? WEBHOOK_SECRET.substring(6)
    : WEBHOOK_SECRET;
  
  const secretBuffer = Buffer.from(secretKeyString, "base64");

  // 2. Prepare the Message to hash
  // content = "${msgId}.${timestamp}.${body}"
  const message = `${id}.${timestamp}.${rawBody}`;

  // 3. Verify the Signature
  // The header might contain multiple signatures separated by spaces (e.g. for key rotation).
  // Format: "v1,signature1 v1,signature2"
  const signatureParts = signatureHeader.split(" ");

  return signatureParts.some((part) => {
    const [version, signature] = part.split(",");
    
    // We only support v1 signatures
    if (version !== "v1") return false;

    // Calculate HMAC
    const expectedHmac = crypto
      .createHmac("sha256", secretBuffer)
      .update(message)
      .digest(); // Result is a Buffer

    const receivedHmac = Buffer.from(signature, "base64");

    // Ensure lengths match before comparison to prevent timing leaks
    if (expectedHmac.length !== receivedHmac.length) return false;

    return crypto.timingSafeEqual(expectedHmac, receivedHmac);
  });
}

// activate a project from a Dodo event
async function handleActivation(event: DodoWebhookEvent) {
  const payload = event.data || event;

  // Payment payload example has customer.email
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
    .eq("owner_email", customerEmail) 
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

  // Log only the first 100 chars to avoid cluttering logs, or full if debugging
  // console.log("Received Dodo webhook raw:", rawBody); 

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
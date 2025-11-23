/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useCurrentProject } from "../hooks/useCurrentProject";

type ApiKeyResponse = { api_key: string };
type LastEventResponse = { last_event_at: string | null };

function formatRelativeTime(iso: string | null): string {
  if (!iso) return "No events received yet";
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d ago`;
}

export default function IntegrationPage() {
  const { projectId, loading: loadingProject, error: projectError } =
    useCurrentProject();

  const [apiKey, setApiKey] = useState<string | null>(null);
  const [lastEventAt, setLastEventAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load API key + last event for THIS project
  useEffect(() => {
    if (!projectId) return;

    async function load() {
      try {
        const [keyRes, lastRes] = await Promise.all([
          fetch(`/api/internal/project/api-key?projectId=${projectId}`),
          fetch(`/api/internal/project/last-event?projectId=${projectId}`),
        ]);

        if (!keyRes.ok) throw new Error("Failed to load API key");
        const keyJson = (await keyRes.json()) as ApiKeyResponse;
        setApiKey(keyJson.api_key);

        if (lastRes.ok) {
          const lastJson = (await lastRes.json()) as LastEventResponse;
          setLastEventAt(lastJson.last_event_at);
        }
      } catch (err) {
        console.error(err);
        setError("Could not load integration data.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [projectId]);

  async function sendTestEvent() {
    if (!apiKey) return;
    setTestSending(true);
    setTestResult(null);
    setError(null);

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          event_type: "user_signed_up",
          external_user_id: "trialrescue_test_user",
          email: "test@example.com",
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json.error || "Failed to send test event");
      }

      setTestResult("Test event sent. Check dashboard and last event time.");

      const lastRes = await fetch(
        `/api/internal/project/last-event?projectId=${projectId}`
      );
      if (lastRes.ok) {
        const lastJson = (await lastRes.json()) as LastEventResponse;
        setLastEventAt(lastJson.last_event_at);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Test event failed");
    } finally {
      setTestSending(false);
    }
  }

  const curlExample = apiKey
    ? `curl -X POST https://your-trialrescue-domain.com/api/events \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -d '{
    "event_type": "user_signed_up",
    "external_user_id": "123",
    "email": "user@example.com"
  }'`
    : "Loading…";

  const jsExample = apiKey
    ? `await fetch("https://your-trialrescue-domain.com/api/events", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer ${apiKey}"
  },
  body: JSON.stringify({
    event_type: "user_activity",
    external_user_id: user.id,
    data: { action: "generated", count: 3 }
  })
});`
    : "Loading…";

  const pythonExample = apiKey
    ? `import requests

requests.post(
    "https://your-trialrescue-domain.com/api/events",
    headers={
        "Content-Type": "application/json",
        "Authorization": "Bearer ${apiKey}",
    },
    json={
        "event_type": "user_upgraded",
        "external_user_id": "123",
        "data": {"plan": "pro", "amount": 29},
    },
)`
    : "Loading…";

  const phpExample = apiKey
    ? `<?php

$ch = curl_init("https://your-trialrescue-domain.com/api/events");
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        "Content-Type: application/json",
        "Authorization: Bearer ${apiKey}",
    ],
    CURLOPT_POSTFIELDS => json_encode([
        "event_type" => "user_activity",
        "external_user_id" => "123",
        "data" => ["action" => "login"],
    ]),
]);
$response = curl_exec($ch);
curl_close($ch);`
    : "Loading…";

  if (loadingProject) {
    return (
      <div className="flex-1 px-4 md:px-6 py-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-400">
          Resolving your project…
        </div>
      </div>
    );
  }

  if (projectError || !projectId) {
    return (
      <div className="flex-1 px-4 md:px-6 py-6">
        <div className="rounded-2xl border border-rose-800/60 bg-rose-950/40 p-4 text-sm text-rose-200">
          {projectError || "No project found for this account."}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 px-4 md:px-6 py-6 space-y-4 overflow-y-auto scrollbar-thin">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
            Integration
          </div>
          <h1 className="text-lg md:text-xl font-semibold text-slate-50">
            Send trial events to TrialRescue
          </h1>
          <p className="mt-1 text-xs text-slate-500 max-w-2xl">
            You only need to send three events from your SaaS:
            <span className="font-mono mx-1 text-slate-300">user_signed_up</span>,
            <span className="font-mono mx-1 text-slate-300">user_activity</span>,
            and
            <span className="font-mono mx-1 text-slate-300">user_upgraded</span>.
            TrialRescue handles the rest.
          </p>
        </div>
        <div className="hidden md:flex flex-col items-end text-xs text-slate-500">
          <span>Last event received</span>
          <span className="text-slate-200">
            {loading ? "Loading…" : formatRelativeTime(lastEventAt)}
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-800/60 bg-rose-950/40 px-3 py-2 text-xs text-rose-100">
          {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 md:p-5">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div>
                <div className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                  Step 1
                </div>
                <div className="text-sm font-semibold text-slate-50">
                  Use this API key in your backend
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-3 font-mono text-[11px] text-slate-100 break-all">
              {loading
                ? "Loading API key…"
                : apiKey || "No API key found for this project."}
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              Keep this key secret. Use it only from your server-side code, never in
              public frontend JavaScript.
            </p>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={sendTestEvent}
                disabled={testSending || !apiKey}
                className="inline-flex items-center rounded-xl border border-cyan-500/60 bg-cyan-500/20 px-3 py-1.5 text-xs font-medium text-cyan-100 hover:bg-cyan-500/30 disabled:opacity-60"
              >
                {testSending ? "Sending test event…" : "Send test signup event"}
              </button>
              <div className="text-[11px] text-slate-500">
                This sends a <span className="font-mono text-slate-300">user_signed_up</span>{" "}
                event for <span className="font-mono text-slate-300">test@example.com</span>.
              </div>
            </div>

            {testResult && (
              <div className="mt-2 text-[11px] text-emerald-400">
                {testResult}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500 mb-1">
              Step 2
            </div>
            <div className="text-sm font-semibold text-slate-50 mb-2">
              Send these three events from your code
            </div>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>
                <span className="font-mono text-slate-200">user_signed_up</span> – when a
                user starts a trial (must include email).
              </li>
              <li>
                <span className="font-mono text-slate-200">user_activity</span> – when they
                do something meaningful in your app.
              </li>
              <li>
                <span className="font-mono text-slate-200">user_upgraded</span> – when they
                become a paying user.
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500 mb-1">
              cURL example
            </div>
            <pre className="mt-2 rounded-xl bg-slate-950/90 border border-slate-800 p-3 text-[11px] text-slate-100 overflow-x-auto">
{curlExample}
            </pre>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500 mb-1">
              Node / JavaScript
            </div>
            <pre className="mt-2 rounded-xl bg-slate-950/90 border border-slate-800 p-3 text-[11px] text-slate-100 overflow-x-auto">
{jsExample}
            </pre>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500 mb-1">
              Python
            </div>
            <pre className="mt-2 rounded-xl bg-slate-950/90 border border-slate-800 p-3 text-[11px] text-slate-100 overflow-x-auto">
{pythonExample}
            </pre>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500 mb-1">
              PHP
            </div>
            <pre className="mt-2 rounded-xl bg-slate-950/90 border border-slate-800 p-3 text-[11px] text-slate-100 overflow-x-auto">
{phpExample}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
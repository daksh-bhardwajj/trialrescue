/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useCurrentProject } from "../hooks/useCurrentProject";
import { 
  Terminal, 
  Copy, 
  Check, 
  Play, 
  Server, 
  Code2, 
  AlertCircle, 
  Loader2,
  Zap,
  Clock,
  ChevronRight,
  ShieldCheck
} from "lucide-react";

type ApiKeyResponse = { api_key: string };
type LastEventResponse = { last_event_at: string | null };

function formatRelativeTime(iso: string | null): string {
  if (!iso) return "No events yet";
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

// 👇 Replace with real deployed URL logic
const API_BASE_URL = "https://your-trialrescue-domain.com";

// --- Components ---

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-black">
      <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-4 py-2">
        <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">{language}</span>
        <button 
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 rounded text-[10px] font-medium text-zinc-500 transition-colors hover:text-white"
        >
          {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="overflow-x-auto p-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <pre className="font-mono text-[11px] leading-relaxed text-zinc-300">
          {code}
        </pre>
      </div>
    </div>
  );
}

export default function IntegrationPage() {
  const { projectId, loading: loadingProject, error: projectError } = useCurrentProject();

  const [apiKey, setApiKey] = useState<string | null>(null);
  const [lastEventAt, setLastEventAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // UI States
  const [copiedKey, setCopiedKey] = useState(false);
  const [activeTab, setActiveTab] = useState<"curl" | "node" | "php">("curl");

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

      setTestResult("Event received successfully.");

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

  const handleCopyKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  // --- Snippets ---
  const curlSignup = apiKey
    ? `curl -X POST ${API_BASE_URL}/api/events \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -d '{
    "event_type": "user_signed_up",
    "external_user_id": "123",
    "email": "user@example.com"
  }'`
    : "Generating snippet...";

  const jsSignup = apiKey
    ? `const response = await fetch("${API_BASE_URL}/api/events", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer ${apiKey}"
  },
  body: JSON.stringify({
    event_type: "user_signed_up",
    external_user_id: user.id,
    email: user.email
  })
});`
    : "Generating snippet...";

  const phpSignup = apiKey
    ? `<?php
$ch = curl_init("${API_BASE_URL}/api/events");
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        "Content-Type: application/json",
        "Authorization: " . "Bearer ${apiKey}",
    ],
    CURLOPT_POSTFIELDS => json_encode([
        "event_type" => "user_signed_up",
        "external_user_id" => $userId,
        "email" => $email,
    ]),
]);
$response = curl_exec($ch);
curl_close($ch);`
    : "Generating snippet...";

  // Advanced snippets
  const jsActivity = apiKey
    ? `// Track usage to identify engaged users
await fetch("${API_BASE_URL}/api/events", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer ${apiKey}"
  },
  body: JSON.stringify({
    event_type: "user_activity",
    external_user_id: user.id,
    data: { action: "generated_report", items: 3 }
  })
});`
    : "...";

  const jsUpgrade = apiKey
    ? `// Track conversions to measure ROI
await fetch("${API_BASE_URL}/api/events", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer ${apiKey}"
  },
  body: JSON.stringify({
    event_type: "user_upgraded",
    external_user_id: user.id,
    data: { plan: "pro", amount: 29 }
  })
});`
    : "...";


  // --- Loading State (Overlay) ---
  if (loadingProject || (loading && !apiKey)) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]">
         <div className="pointer-events-none absolute inset-0 opacity-[0.1]">
            <div className="h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
         </div>
         <div className="relative flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-500">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.08] shadow-2xl backdrop-blur-md">
               <Terminal size={24} className="relative z-10 text-white animate-pulse" />
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-600 animate-pulse">
               Connecting
            </div>
         </div>
      </div>
    );
  }

  // --- Error State ---
  if (projectError || !projectId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] text-zinc-400">
        <div className="rounded-lg border border-red-900/30 bg-red-950/10 px-6 py-4 text-sm backdrop-blur-md flex items-center gap-3">
          <AlertCircle size={16} className="text-red-400" />
          {projectError || "No project found for this account."}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-[#050505] font-sans selection:bg-white/20">
      
      {/* Background Grid */}
      <div className="pointer-events-none fixed inset-0 z-0 flex justify-center opacity-[0.15]">
        <div className="h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto px-6 py-8 md:px-12 md:py-10">
        <div className="mx-auto max-w-6xl space-y-10">
          
          {/* Header */}
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end border-b border-white/[0.08] pb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-widest text-zinc-500">
                <Terminal size={12} />
                Developer API
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Integration
              </h1>
              <p className="text-[13px] text-zinc-400 max-w-lg">
                Connect your backend in minutes. Simply send a `user_signed_up` event, and we handle the rest.
              </p>
            </div>

            <div className="flex flex-col items-end gap-1">
               <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">Last Event Received</span>
               <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-300">
                 <div className={`h-1.5 w-1.5 rounded-full ${lastEventAt ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" : "bg-zinc-600"}`} />
                 {loading ? <Loader2 size={12} className="animate-spin" /> : formatRelativeTime(lastEventAt)}
               </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
            
            {/* Left Column: Primary Steps */}
            <div className="space-y-8">
              
              {/* Step 1: API Key */}
              <div className="group rounded-2xl border border-white/[0.08] bg-[#0A0A0A] p-6 backdrop-blur-sm transition-all hover:border-white/[0.12]">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-zinc-400 border border-white/5 shadow-inner">
                        <span className="text-xs font-bold">01</span>
                    </div>
                    <h3 className="text-sm font-semibold text-zinc-200">Server API Key</h3>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-500">
                    <ShieldCheck size={10} />
                    Backend Only
                  </div>
                </div>

                <div className="relative mb-4 flex items-center justify-between rounded-xl border border-white/10 bg-black/50 px-4 py-3 font-mono text-[13px] text-zinc-300">
                   <span className="truncate pr-4 opacity-80">{apiKey || "Loading..."}</span>
                   <button 
                     onClick={handleCopyKey}
                     className="shrink-0 rounded bg-white/10 p-1.5 text-zinc-400 transition-colors hover:bg-white/20 hover:text-white"
                     title="Copy API Key"
                   >
                      {copiedKey ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                   </button>
                </div>

                <div className="flex flex-wrap items-center gap-4 border-t border-white/[0.06] pt-4">
                  <button
                    onClick={sendTestEvent}
                    disabled={testSending || !apiKey}
                    className="flex items-center gap-2 rounded-lg bg-white/[0.05] px-4 py-2 text-[12px] font-medium text-white ring-1 ring-inset ring-white/10 transition-all hover:bg-white/[0.1] active:scale-95 disabled:opacity-50"
                  >
                    {testSending ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} className="text-emerald-500" />}
                    {testSending ? "Sending..." : "Send Test Event"}
                  </button>
                  
                  {testResult && (
                    <div className="flex items-center gap-2 text-[12px] text-emerald-400 animate-in fade-in slide-in-from-left-2">
                       <Check size={14} />
                       {testResult}
                    </div>
                  )}
                  {error && (
                     <div className="flex items-center gap-2 text-[12px] text-red-400 animate-in fade-in">
                       <AlertCircle size={14} />
                       {error}
                     </div>
                  )}
                </div>
              </div>

              {/* Step 2: Implementation */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#0A0A0A] p-6 backdrop-blur-sm">
                <div className="mb-6 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-zinc-400 border border-white/5 shadow-inner">
                        <span className="text-xs font-bold">02</span>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-zinc-200">Trigger Signup Event</h3>
                        <p className="text-[11px] text-zinc-500">Send this when a user registers.</p>
                    </div>
                  </div>
                  
                  {/* Language Tabs */}
                  <div className="flex items-center gap-1 rounded-lg bg-black/40 p-1 border border-white/[0.04]">
                     {(["curl", "node", "php"] as const).map((lang) => (
                       <button
                         key={lang}
                         onClick={() => setActiveTab(lang)}
                         className={`px-3 py-1 text-[11px] font-medium rounded-md transition-all ${
                           activeTab === lang 
                             ? "bg-white/10 text-white shadow-sm" 
                             : "text-zinc-500 hover:text-zinc-300"
                         }`}
                       >
                         {lang === 'curl' ? 'cURL' : lang === 'node' ? 'Node.js' : 'PHP'}
                       </button>
                     ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {activeTab === "curl" && <CodeBlock language="BASH" code={curlSignup} />}
                  {activeTab === "node" && <CodeBlock language="JAVASCRIPT" code={jsSignup} />}
                  {activeTab === "php" && <CodeBlock language="PHP" code={phpSignup} />}
                </div>
              </div>

            </div>

            {/* Right Column: Advanced */}
            <div className="space-y-6">
               <div className="sticky top-6 rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6 backdrop-blur-sm">
                  <div className="mb-4 flex items-center gap-2">
                     <Zap size={16} className="text-amber-500" />
                     <h3 className="text-sm font-semibold text-zinc-200">Advanced Tracking</h3>
                  </div>
                  
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[12px] font-medium text-zinc-300">Track Activity</h4>
                            <span className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] text-zinc-500">Optional</span>
                        </div>
                        <p className="text-[11px] text-zinc-500 leading-relaxed">
                            Sends <code className="bg-white/10 px-1 py-0.5 rounded text-white">user_activity</code> to prove user is alive and stop nudges if needed.
                        </p>
                        <CodeBlock language="JS" code={jsActivity} />
                     </div>

                     <div className="h-px w-full bg-white/5" />

                     <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[12px] font-medium text-zinc-300">Track Conversion</h4>
                            <span className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] text-zinc-500">Optional</span>
                        </div>
                         <p className="text-[11px] text-zinc-500 leading-relaxed">
                            Sends <code className="bg-white/10 px-1 py-0.5 rounded text-white">user_upgraded</code> to attribute revenue to recovered users.
                        </p>
                        <CodeBlock language="JS" code={jsUpgrade} />
                     </div>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
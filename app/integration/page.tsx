/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useCurrentProject } from "../hooks/useCurrentProject";
import { 
  Terminal, 
  Copy, 
  Check, 
  Play, 
  ShieldCheck, 
  AlertCircle, 
  Loader2,
  Zap,
  LayoutDashboard,
  Layers,
  Settings,
  LogOut,
  Sparkles,
  ChevronLeft,
  Code2
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

const API_BASE_URL = "https://trialrescue.vercel.app";

// --- UI Components ---

function NavItem({
  href,
  icon: Icon,
  label,
  isActive,
}: {
  href: string;
  icon: any;
  label: string;
  isActive?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group relative flex items-center gap-3.5 rounded-2xl px-4 py-3 text-[13px] font-medium transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
        isActive
          ? "bg-white/[0.08] text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]"
          : "text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-200"
      }`}
    >
      {isActive && (
        <div className="absolute left-0 h-6 w-1 rounded-r-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
      )}
      <Icon
        size={18}
        strokeWidth={2}
        className={`transition-transform duration-300 ${
          isActive ? "scale-110 text-white" : "text-zinc-600 group-hover:scale-105 group-hover:text-zinc-400"
        }`}
      />
      <span className="relative z-10">{label}</span>
    </Link>
  );
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#050505] shadow-xl">
      <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.03] px-4 py-2.5 backdrop-blur-md">
        <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500/20 border border-red-500/30" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500/20 border border-amber-500/30" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/30" />
            </div>
            <span className="ml-2 text-[10px] font-mono font-medium text-zinc-500 uppercase tracking-wider">{language}</span>
        </div>
        <button 
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-1 text-[10px] font-medium text-zinc-500 transition-all hover:bg-white/10 hover:text-white"
        >
          {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="overflow-x-auto p-5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <pre className="font-mono text-[12px] leading-relaxed text-zinc-300 selection:bg-white/20">
          {code}
        </pre>
      </div>
    </div>
  );
}

export default function IntegrationPage() {
  const router = useRouter();
  const pathname = usePathname();
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

  // --- Auth & Data Loading ---
  async function handleLogout() {
    try {
      await supabaseBrowser.auth.signOut();
      router.push("/auth");
    } catch (err) {
      console.error("Error signing out", err);
    }
  }

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

  const curlSignup = apiKey
    ? `curl -X POST ${API_BASE_URL}/api/events \\
  -H "Content-Type: application/json" \\
  -H "x-trialrescue-api-key: ${apiKey}" \\
  -d '{
    "event_type": "user_signed_up",
    "external_user_id": "123",
    "email": "user@example.com"
  }'`
    : "Generating snippet...";

  // ADDED QUOTES around ${apiKey}
  const jsSignup = apiKey
    ? `const response = await fetch("${API_BASE_URL}/api/events", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-trialrescue-api-key": "${apiKey}", 
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
        "x-trialrescue-api-key: ${apiKey}",
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

  // ADDED QUOTES around ${apiKey}
  const jsActivity = apiKey
    ? `// Track usage to identify engaged users
await fetch("${API_BASE_URL}/api/events", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-trialrescue-api-key": "${apiKey}",
  },
  body: JSON.stringify({
    event_type: "user_activity",
    external_user_id: user.id,
    data: { action: "generated_report", items: 3 }
  })
});`
    : "...";

  // ADDED QUOTES around ${apiKey}
  const jsUpgrade = apiKey
    ? `// Track conversions to measure ROI
await fetch("${API_BASE_URL}/api/events", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-trialrescue-api-key": "${apiKey}",
  },
  body: JSON.stringify({
    event_type: "user_upgraded",
    external_user_id: user.id,
    data: { plan: "pro", amount: 29 }
  })
});` 
    : "...";


  // --- Loading State ---
  if (loadingProject || (loading && !apiKey)) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
         <div className="relative flex flex-col items-center justify-center">
            <div className="absolute inset-0 -z-10 animate-ping rounded-full bg-white/5 opacity-20 duration-1000" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gradient-to-tr from-zinc-800 to-zinc-900 shadow-[0_0_40px_-10px_rgba(255,255,255,0.1)] ring-1 ring-white/10">
               <Terminal size={32} className="text-white fill-white animate-pulse" />
            </div>
            <div className="mt-8 flex flex-col items-center gap-2">
                <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-500 animate-pulse">
                   Connecting
                </div>
            </div>
         </div>
      </div>
    );
  }

  // --- Error State ---
  if (projectError || !projectId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-zinc-400">
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-zinc-900/50 p-8 backdrop-blur-xl">
          <div className="rounded-full bg-red-500/10 p-3 text-red-400">
              <AlertCircle size={20} />
          </div>
          <p className="text-sm font-medium">{projectError || "No project found."}</p>
          <button onClick={() => router.push('/auth')} className="text-xs text-white underline decoration-zinc-600 underline-offset-4">Return to login</button>
        </div>
      </div>
    );
  }

  // --- Main Layout & UI ---
  return (
    <div className="flex h-screen w-full bg-black font-sans text-zinc-100 selection:bg-white/20 overflow-hidden">
      
      {/* Ambient Background */}
      <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-500/[0.02] blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-cyan-500/[0.02] blur-[120px]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      {/* Sidebar - Floating Dock */}
      <aside className="relative z-20 hidden w-[280px] flex-col p-4 md:flex">
        <div className="flex h-full flex-col justify-between rounded-[32px] border border-white/[0.06] bg-[#0A0A0A]/60 px-4 py-6 backdrop-blur-2xl shadow-2xl">
            <div className="space-y-8">
                {/* Brand */}
                <div className="flex items-center gap-4 px-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-white to-zinc-400 text-black shadow-lg shadow-white/10">
                        <Zap size={20} fill="currentColor" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold tracking-tight text-white">TrialRescue</span>
                        <span className="text-[10px] font-medium text-zinc-500">Pro Workspace</span>
                    </div>
                </div>

                {/* Nav */}
                <nav className="space-y-1">
                    <div className="px-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600">Menu</div>
                    <NavItem href="/app" icon={LayoutDashboard} label="Overview" isActive={pathname === "/app"} />
                    <NavItem href="/integration" icon={Layers} label="Integration" isActive={pathname === "/integration"} />
                    <NavItem href="/settings" icon={Settings} label="Settings" isActive={pathname === "/settings"} />
                </nav>
            </div>

            {/* Footer */}
            <div>
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-[13px] font-medium text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                >
                    <LogOut size={18} />
                    Sign out
                </button>
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
        <div className="mx-auto max-w-6xl animate-in slide-in-from-bottom-8 fade-in duration-700 space-y-8">
          
          {/* Mobile Header (Back Button) */}
          <div className="md:hidden flex items-center gap-2 mb-4">
            <Link href="/app" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md">
                <ChevronLeft size={20} className="text-white" />
            </Link>
            <span className="text-lg font-bold text-white">Integration</span>
          </div>

          {/* Header */}
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end border-b border-white/[0.06] pb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                <Terminal size={12} />
                Developer API
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-md">
                Integration
              </h1>
              <p className="text-[13px] text-zinc-400 max-w-lg leading-relaxed">
                Connect your backend in minutes. Simply send a <span className="text-white font-mono">user_signed_up</span> event, and we handle the rest.
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
               <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Event Status</span>
               <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs font-medium text-zinc-300 backdrop-blur-md">
                 <div className={`h-2 w-2 rounded-full ${lastEventAt ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" : "bg-zinc-600"}`} />
                 {loading ? <Loader2 size={12} className="animate-spin" /> : formatRelativeTime(lastEventAt)}
               </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
            
            {/* Left Column: Primary Steps */}
            <div className="space-y-6">
              
              {/* Step 1: API Key */}
              <div className="group rounded-[32px] border border-white/[0.06] bg-[#121212]/40 p-8 backdrop-blur-xl transition-all hover:border-white/[0.12]">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05] text-white border border-white/[0.05] shadow-inner">
                        <span className="text-sm font-bold">01</span>
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-white">Server API Key</h3>
                        <p className="text-[12px] text-zinc-500">Authenticate your backend requests.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                    <ShieldCheck size={12} />
                    Secret
                  </div>
                </div>

                <div className="relative mb-6 flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-5 py-4 font-mono text-[13px] text-zinc-300 shadow-inner">
                   <div className="flex-1 truncate pr-4 opacity-80 font-medium">
                      {apiKey || "Loading..."}
                   </div>
                   <button 
                     onClick={handleCopyKey}
                     className="shrink-0 rounded-lg bg-white/10 p-2 text-zinc-400 transition-colors hover:bg-white/20 hover:text-white"
                     title="Copy API Key"
                   >
                      {copiedKey ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                   </button>
                </div>

                <div className="flex flex-wrap items-center gap-4 border-t border-white/[0.06] pt-6">
                  <button
                    onClick={sendTestEvent}
                    disabled={testSending || !apiKey}
                    className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-[12px] font-bold text-black transition-all hover:scale-105 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {testSending ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
                    {testSending ? "Sending..." : "Send Test Event"}
                  </button>
                  
                  {testResult && (
                    <div className="flex items-center gap-2 text-[12px] text-emerald-400 animate-in fade-in slide-in-from-left-2 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
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
              <div className="rounded-[32px] border border-white/[0.06] bg-[#121212]/40 p-8 backdrop-blur-xl">
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                   <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05] text-white border border-white/[0.05] shadow-inner">
                        <span className="text-sm font-bold">02</span>
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-white">Trigger Event</h3>
                        <p className="text-[12px] text-zinc-500">Send when a user registers.</p>
                    </div>
                  </div>
                  
                  {/* Language Tabs */}
                  <div className="flex items-center p-1 rounded-xl bg-black/40 border border-white/[0.06]">
                     {(["curl", "node", "php"] as const).map((lang) => (
                       <button
                         key={lang}
                         onClick={() => setActiveTab(lang)}
                         className={`px-4 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
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

                <div className="space-y-4 animate-in fade-in duration-300">
                  {activeTab === "curl" && <CodeBlock language="BASH" code={curlSignup} />}
                  {activeTab === "node" && <CodeBlock language="JAVASCRIPT" code={jsSignup} />}
                  {activeTab === "php" && <CodeBlock language="PHP" code={phpSignup} />}
                </div>
              </div>

            </div>

            {/* Right Column: Advanced */}
            <div className="space-y-6">
               <div className="sticky top-6 rounded-[32px] border border-zinc-800 bg-gradient-to-br from-zinc-900/40 to-black/40 p-8 backdrop-blur-xl">
                  <div className="mb-6 flex items-center gap-3">
                     <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        <Zap size={16} fill="currentColor" />
                     </div>
                     <h3 className="text-sm font-semibold text-white">Advanced Tracking</h3>
                  </div>
                  
                  <div className="space-y-8">
                     <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Code2 size={14} className="text-zinc-500" />
                                <h4 className="text-[12px] font-bold text-zinc-300 uppercase tracking-wide">Activity</h4>
                            </div>
                            <span className="rounded-full bg-white/5 border border-white/5 px-2 py-0.5 text-[9px] font-medium text-zinc-500">Optional</span>
                        </div>
                        <p className="text-[11px] text-zinc-500 leading-relaxed">
                            Sends <code className="bg-white/10 px-1 py-0.5 rounded text-white border border-white/5">user_activity</code> to prove user is alive and stop nudges.
                        </p>
                        <CodeBlock language="JS" code={jsActivity} />
                     </div>

                     <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                     <div className="space-y-3">
                        <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                <Code2 size={14} className="text-zinc-500" />
                                <h4 className="text-[12px] font-bold text-zinc-300 uppercase tracking-wide">Conversion</h4>
                            </div>
                            <span className="rounded-full bg-white/5 border border-white/5 px-2 py-0.5 text-[9px] font-medium text-zinc-500">Optional</span>
                        </div>
                         <p className="text-[11px] text-zinc-500 leading-relaxed">
                            Sends <code className="bg-white/10 px-1 py-0.5 rounded text-white border border-white/5">user_upgraded</code> to attribute revenue.
                        </p>
                        <CodeBlock language="JS" code={jsUpgrade} />
                     </div>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Terminal,
  LogOut,
  ChevronLeft,
  ShieldCheck,
  Copy,
  Check,
  Play,
  Loader2,
  AlertCircle,
  LayoutDashboard,
  Layers,
  Settings,
  CreditCard,
  Sparkles,
  Zap,
  Code2,
  LucideLoader
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useCurrentProject } from "@/app/hooks/useCurrentProject";

type ApiKeyResponse = {
  api_key: string | null;
};

type LastEventResponse = {
  last_event_at: string | null;
};

type BillingInfo = {
  id: string;
  billing_status: string | null;
  billing_plan: string | null;
};

// --- Utils ---

function formatRelativeTime(iso: string | null): string {
  if (!iso) return "No events yet";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown";

  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

// --- Components ---

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
      className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-300 ease-out ${
        isActive
          ? "bg-white/[0.08] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
          : "text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-200"
      }`}
    >
      <Icon
        size={18}
        strokeWidth={2}
        className={`transition-colors duration-300 ${
          isActive ? "text-white" : "text-zinc-600 group-hover:text-zinc-400"
        }`}
      />
      <span className="relative z-10">{label}</span>
      {isActive && (
        <div className="absolute right-2 h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
      )}
    </Link>
  );
}

function CodeBlock({
  label,
  description,
  code,
  onCopy,
  copied,
}: {
  label: string;
  description: string;
  code: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#0A0A0A] shadow-2xl transition-all hover:border-white/[0.12]">
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-5 py-3">
        <div className="flex items-center gap-3">
           <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500/20 border border-red-500/30" />
              <div className="h-2.5 w-2.5 rounded-full bg-amber-500/20 border border-amber-500/30" />
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/30" />
           </div>
           <div className="flex flex-col ml-1">
              <span className="text-[11px] font-bold text-zinc-300">{label}</span>
           </div>
        </div>
        <button
          onClick={onCopy}
          className="flex items-center gap-1.5 rounded-md bg-white/5 px-2 py-1 text-[10px] font-medium text-zinc-500 transition-all hover:bg-white/10 hover:text-white"
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="relative">
         <div className="overflow-x-auto p-5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <pre className="font-mono text-[12px] leading-relaxed text-zinc-400 selection:bg-white/20">
               {code}
            </pre>
         </div>
      </div>
    </div>
  );
}

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://trialrescue.vercel.app";

// --- Main Page ---

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
  const [billing, setBilling] = useState<BillingInfo | null>(null);

  // UI States
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<"curl" | "node" | "php">("curl");
  const [showKey, setShowKey] = useState(false);

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
        const [keyRes, lastRes, billingRes] = await Promise.all([
          fetch(`/api/internal/project/api-key?projectId=${projectId}`),
          fetch(`/api/internal/project/last-event?projectId=${projectId}`),
          fetch(`/api/internal/project/billing?projectId=${projectId}`),
        ]);

        if (!keyRes.ok) throw new Error("Failed to load API key");
        const keyJson = (await keyRes.json()) as ApiKeyResponse;
        setApiKey(keyJson.api_key);

        if (lastRes.ok) {
          const lastJson = (await lastRes.json()) as LastEventResponse;
          setLastEventAt(lastJson.last_event_at);
        }

        if (billingRes.ok) {
            const billingJson = await billingRes.json();
            setBilling(billingJson);
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
          "x-trialrescue-api-key": `${apiKey}`,
        },
        body: JSON.stringify({
          event: "user_signed_up",
          user: {
            id: "trialrescue_test_user",
            email: "test@example.com",
          },
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

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const status = billing?.billing_status || "free";
  const isActive = status === "active";

  // --- Snippets ---
  const curlSignup = apiKey
    ? `curl -X POST ${API_BASE_URL}/api/events \\
  -H "Content-Type: application/json" \\
  -H "x-trialrescue-api-key: ${apiKey}" \\
  -d '{
    "event": "user_signed_up",
    "user": {
      "id": "123",
      "email": "user@example.com"
    }
  }'`
    : "Generating snippet...";

  const jsSignup = apiKey
    ? `const response = await fetch("${API_BASE_URL}/api/events", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-trialrescue-api-key": "${apiKey}",
  },
  body: JSON.stringify({
    event: "user_signed_up",
    user: {
      id: user.id,
      email: user.email,
    },
  }),
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
        "event" => "user_signed_up",
        "user" => [
            "id" => $userId,
            "email" => $email,
        ],
    ]),
]);
$response = curl_exec($ch);
curl_close($ch);`
    : "Generating snippet...";

  const codeMap: Record<"curl" | "node" | "php", string> = {
    curl: curlSignup,
    node: jsSignup,
    php: phpSignup,
  };

  const activeCode = codeMap[activeTab];

  // --- Loading State ---
  if (loadingProject || (loading && !apiKey)) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
         <div className="flex flex-col items-center gap-6">
            <div className="relative h-16 w-16 flex items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                <Terminal size={32} className="text-zinc-500 animate-pulse" />
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
          <button
            onClick={() => router.push("/auth")}
            className="text-xs text-white underline decoration-zinc-600 underline-offset-4"
          >
            Return to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-black font-sans text-zinc-100 selection:bg-white/20 overflow-hidden">
      
      {/* Sidebar */}
      <aside className="relative z-20 hidden w-[260px] flex-col p-4 md:flex">
        <div className="flex h-full flex-col justify-between rounded-[24px] border border-white/[0.08] bg-[#050505] px-4 py-6 shadow-2xl">
          
          <div className="space-y-8">
            {/* Brand */}
            <div className="flex items-center gap-3 px-2">
              <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-white p-1 text-black shadow-lg shadow-white/20">
                <Image
                  src="/logo.png"
                  alt="TrialRescue"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-white">
                  TrialRescue
                </span>
                <span className={`text-[10px] font-medium ${isActive ? "text-emerald-400" : "text-zinc-500"}`}>
                  {isActive ? "Pro Workspace" : "Free Plan"}
                </span>
              </div>
            </div>

            {/* Nav */}
            <nav className="space-y-1">
              <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                Platform
              </div>
              <NavItem
                href="/app"
                icon={LayoutDashboard}
                label="Overview"
                isActive={pathname === "/app"}
              />
              <NavItem
                href="/integration"
                icon={Layers}
                label="Integration"
                isActive={pathname === "/integration"}
              />
              <NavItem
                href="/settings"
                icon={Settings}
                label="Settings"
                isActive={pathname === "/settings"}
              />
              <NavItem
                href="/billing"
                icon={isActive ? CreditCard : Sparkles}
                label={isActive ? "Billing" : "Upgrade"}
                isActive={pathname === "/billing"}
              />
            </nav>
          </div>

          <div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[12px] font-medium text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative z-10 flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
        <div className="mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8">
          
          {/* Mobile Header */}
          <div className="md:hidden flex items-center gap-2 mb-4">
            <Link
              href="/app"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md"
            >
              <ChevronLeft size={20} className="text-white" />
            </Link>
            <span className="text-lg font-bold text-white">Integration</span>
          </div>

          {/* Page Header */}
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
                Connect your backend in minutes. Send <span className="text-white font-mono">user_signed_up</span> to start tracking trials automatically.
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                Last Event
              </span>
              <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs font-medium text-zinc-300 backdrop-blur-md">
                <div
                  className={`h-2 w-2 rounded-full ${
                    lastEventAt
                      ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse"
                      : "bg-zinc-600"
                  }`}
                />
                {loading ? (
                  <LucideLoader size={12} className="animate-spin" />
                ) : (
                  formatRelativeTime(lastEventAt)
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
            
            {/* Left Column: Config */}
            <div className="space-y-8">
              
              {/* API Key Card */}
              <div className="group rounded-[32px] border border-white/[0.06] bg-[#0A0A0A] p-8 transition-all hover:border-white/[0.12] hover:shadow-2xl">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05] text-white border border-white/[0.05] shadow-inner">
                      <span className="text-sm font-bold font-mono">01</span>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">
                        Server API Key
                      </h3>
                      <p className="text-[12px] text-zinc-500">
                        Private key for backend requests.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                    <ShieldCheck size={12} />
                    Secret
                  </div>
                </div>

                <div 
                    className="relative mb-6 rounded-2xl border border-white/10 bg-[#050505] px-5 py-4 shadow-inner cursor-pointer group/key"
                    onClick={() => setShowKey(!showKey)}
                >
                  <div className={`font-mono text-[13px] text-zinc-300 transition-all duration-300 ${showKey ? 'blur-0' : 'blur-sm group-hover/key:blur-none'}`}>
                    {apiKey || "Loading..."}
                  </div>
                  <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleCopyKey();
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-white/10 p-2 text-zinc-400 transition-colors hover:bg-white/20 hover:text-white"
                    title="Copy API Key"
                  >
                    {copiedKey ? (
                      <Check size={16} className="text-emerald-400" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-4 border-t border-white/[0.06] pt-6">
                  <button
                    onClick={sendTestEvent}
                    disabled={testSending || !apiKey}
                    className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-[12px] font-bold text-black transition-all hover:scale-105 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {testSending ? (
                      <LucideLoader size={14} className="animate-spin" />
                    ) : (
                      <Play size={14} fill="currentColor" />
                    )}
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

              {/* Implementation Card */}
              <div className="rounded-[32px] border border-white/[0.06] bg-[#0A0A0A] p-8">
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05] text-white border border-white/[0.05] shadow-inner">
                      <span className="text-sm font-bold font-mono">02</span>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">
                        Trigger Events
                      </h3>
                      <p className="text-[12px] text-zinc-500">
                        Code snippets for your backend.
                      </p>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex items-center p-1 rounded-xl bg-[#050505] border border-white/[0.06]">
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
                        {lang === "curl" ? "cURL" : lang === "node" ? "Node.js" : "PHP"}
                      </button>
                    ))}
                  </div>
                </div>

                <CodeBlock
                  label={
                    activeTab === "curl"
                      ? "Shell Command"
                      : activeTab === "node"
                      ? "Node.js / TS"
                      : "PHP Script"
                  }
                  description="Paste this where you create new users."
                  code={activeCode}
                  onCopy={() => handleCopyCode(activeCode)}
                  copied={copiedCode}
                />
              </div>
            </div>

            {/* Right Column: Documentation */}
            <div className="space-y-6">
               <div className="rounded-[32px] border border-white/[0.06] bg-[#0A0A0A] p-8 sticky top-6">
                  <div className="flex items-center gap-3 mb-6">
                     <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-900/20 text-emerald-400 border border-emerald-500/20">
                        <Code2 size={16} />
                     </div>
                     <h3 className="text-sm font-bold text-white">Event Reference</h3>
                  </div>
                  
                  <div className="space-y-6">
                      <div className="space-y-2">
                         <div className="flex items-center justify-between">
                            <span className="font-mono text-xs text-white bg-white/10 px-1.5 py-0.5 rounded">user_signed_up</span>
                            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Required</span>
                         </div>
                         <p className="text-[11px] text-zinc-400 leading-relaxed">
                            Fires when a user starts a trial. This initializes the inactivity tracker.
                         </p>
                      </div>

                      <div className="h-px w-full bg-white/5" />

                      <div className="space-y-2">
                         <div className="flex items-center justify-between">
                            <span className="font-mono text-xs text-white bg-white/10 px-1.5 py-0.5 rounded">user_activity</span>
                            <span className="text-[10px] text-zinc-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">Optional</span>
                         </div>
                         <p className="text-[11px] text-zinc-400 leading-relaxed">
                            Sends a heartbeat. If we receive this, we know the user is active and won't send "come back" nudges.
                         </p>
                      </div>

                      <div className="h-px w-full bg-white/5" />

                      <div className="space-y-2">
                         <div className="flex items-center justify-between">
                            <span className="font-mono text-xs text-white bg-white/10 px-1.5 py-0.5 rounded">user_upgraded</span>
                            <span className="text-[10px] text-zinc-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">Optional</span>
                         </div>
                         <p className="text-[11px] text-zinc-400 leading-relaxed">
                            Stops all future nudges and attributes revenue to TrialRescue if they were previously nudged.
                         </p>
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
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useCurrentProject } from "../hooks/useCurrentProject";
import { 
  Save, 
  Globe, 
  Zap, 
  Mail, 
  MessageSquare, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Calendar,
  LayoutDashboard,
  Layers,
  Settings as SettingsIcon,
  LogOut,
  Sparkles,
  ChevronLeft
} from "lucide-react";

// --- Types ---
type Settings = {
  project_id: string;
  trial_length_days: number;
  inactivity_days_nudge1: number;
  inactivity_days_nudge2: number;
  inactivity_days_nudge3: number;
  app_url: string | null;
  automation_enabled: boolean;
  product_name: string | null;
  support_email: string | null;
};

// --- Shared UI Components (Sidebar/Nav) ---

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

export default function SettingsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { projectId, loading: loadingProject, error: projectError } = useCurrentProject();

  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/internal/project/settings?projectId=${projectId}`
        );
        if (!res.ok) {
          throw new Error("Failed to load settings");
        }
        const json = (await res.json()) as Settings;
        if (!cancelled) {
          setSettings(json);
        }
      } catch (err: any) {
        console.error(err);
        if (!cancelled) {
          setError(err.message || "Failed to load settings");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    setSaveMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/internal/project/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json.error || "Failed to save settings");
      }

      setSettings(json as Settings);
      setSaveMessage("Changes saved successfully.");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  }

  function updateField<K extends keyof Settings>(key: K, value: Settings[K]) {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  }

  // --- Loading State (iOS Style) ---
  if (loadingProject || (loading && !settings)) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
         <div className="relative flex flex-col items-center justify-center">
            <div className="absolute inset-0 -z-10 animate-ping rounded-full bg-white/5 opacity-20 duration-1000" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gradient-to-tr from-zinc-800 to-zinc-900 shadow-[0_0_40px_-10px_rgba(255,255,255,0.1)] ring-1 ring-white/10">
               <Zap size={32} className="text-white fill-white animate-pulse" />
            </div>
            <div className="mt-8 flex flex-col items-center gap-2">
                <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-500 animate-pulse">
                   Loading Config
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
          <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-purple-500/[0.02] blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-500/[0.02] blur-[120px]" />
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
                    <NavItem href="/settings" icon={SettingsIcon} label="Settings" isActive={pathname === "/settings"} />
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
         <div className="mx-auto max-w-4xl animate-in slide-in-from-bottom-8 fade-in duration-700 space-y-8">
            
            {/* Mobile Header (Back Button) */}
            <div className="md:hidden flex items-center gap-2 mb-4">
                <Link href="/app" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md">
                    <ChevronLeft size={20} className="text-white" />
                </Link>
                <span className="text-lg font-bold text-white">Settings</span>
            </div>

            {/* Header */}
            <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-white/[0.06] pb-8">
                <div>
                   <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-md">
                     Branding & Automation
                   </h1>
                   <p className="mt-2 text-[13px] text-zinc-400 max-w-lg leading-relaxed">
                     Configure how TrialRescue represents your brand and define the engagement rules for inactive users.
                   </p>
                </div>
                
                {/* Status / Save Action */}
                <div className="flex items-center gap-4">
                    {saveMessage ? (
                         <div className="flex items-center gap-2 text-[12px] text-emerald-400 animate-in fade-in slide-in-from-right-4 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                            <CheckCircle2 size={14} />
                            <span>{saveMessage}</span>
                        </div>
                    ) : (
                        <button
                          type="button"
                          disabled={saving}
                          onClick={handleSave}
                          className="group relative flex items-center justify-center gap-2 rounded-full bg-white px-6 py-2.5 text-[13px] font-bold text-black transition-all hover:bg-zinc-200 hover:scale-105 active:scale-95 disabled:opacity-70"
                        >
                           {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                           {saving ? "Saving..." : "Save Changes"}
                        </button>
                    )}
                </div>
            </header>

            {error && (
               <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] text-red-200 flex items-center gap-3 backdrop-blur-sm">
                  <AlertCircle size={16} />
                  {error}
               </div>
            )}

            {/* Content Cards */}
            <div className="space-y-6">

              {/* Card 1: Branding */}
              <div className="group rounded-[32px] border border-white/[0.06] bg-[#121212]/40 p-6 md:p-8 backdrop-blur-xl transition-all hover:border-white/[0.1] hover:bg-[#121212]/60">
                 <div className="mb-8 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.05] text-white border border-white/[0.05] shadow-inner">
                        <Globe size={20} />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-white">Brand Identity</h3>
                        <p className="text-[12px] text-zinc-500">Appearance in emails and links.</p>
                    </div>
                 </div>

                 <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider pl-1">Product Name</label>
                        <div className="relative group/input">
                            <input
                              type="text"
                              value={settings?.product_name ?? ""}
                              onChange={(e) => updateField("product_name", e.target.value || null)}
                              placeholder="e.g. Acme SaaS"
                              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 pl-11 text-sm text-white placeholder:text-zinc-700 outline-none transition-all focus:border-white/30 focus:bg-white/[0.05] focus:ring-1 focus:ring-white/30"
                            />
                            <MessageSquare size={16} className="absolute left-4 top-3.5 text-zinc-600 transition-colors group-focus-within/input:text-white" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider pl-1">Support Email</label>
                        <div className="relative group/input">
                            <input
                              type="email"
                              value={settings?.support_email ?? ""}
                              onChange={(e) => updateField("support_email", e.target.value || null)}
                              placeholder="support@acme.com"
                              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 pl-11 text-sm text-white placeholder:text-zinc-700 outline-none transition-all focus:border-white/30 focus:bg-white/[0.05] focus:ring-1 focus:ring-white/30"
                            />
                            <Mail size={16} className="absolute left-4 top-3.5 text-zinc-600 transition-colors group-focus-within/input:text-white" />
                        </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider pl-1">App URL</label>
                        <div className="relative group/input">
                            <input
                              type="url"
                              value={settings?.app_url ?? ""}
                              onChange={(e) => updateField("app_url", e.target.value || null)}
                              placeholder="https://app.acme.com/dashboard"
                              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 pl-11 text-sm text-white placeholder:text-zinc-700 outline-none transition-all focus:border-white/30 focus:bg-white/[0.05] focus:ring-1 focus:ring-white/30"
                            />
                            <Globe size={16} className="absolute left-4 top-3.5 text-zinc-600 transition-colors group-focus-within/input:text-white" />
                        </div>
                    </div>
                 </div>
              </div>

              {/* Card 2: Automation */}
              <div className={`group rounded-[32px] border p-6 md:p-8 backdrop-blur-xl transition-all duration-500 ${settings?.automation_enabled ? "border-emerald-500/30 bg-emerald-950/[0.05]" : "border-white/[0.06] bg-[#121212]/40"}`}>
                 <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border shadow-inner transition-colors duration-300 ${settings?.automation_enabled ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" : "bg-white/[0.05] border-white/[0.05] text-zinc-400"}`}>
                           <Zap size={20} fill={settings?.automation_enabled ? "currentColor" : "none"} />
                        </div>
                        <div>
                           <h3 className={`text-base font-semibold transition-colors ${settings?.automation_enabled ? "text-emerald-300" : "text-white"}`}>Automation Logic</h3>
                           <p className="text-[12px] text-zinc-500">Enable to start sending nudges.</p>
                        </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => updateField("automation_enabled", !settings?.automation_enabled)}
                      className={`relative h-8 w-14 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-black ${
                        settings?.automation_enabled ? "bg-emerald-500" : "bg-zinc-800"
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow-lg transition-all duration-300 ${
                          settings?.automation_enabled ? "translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </button>
                 </div>

                 {/* Timeline Inputs */}
                 <div className={`grid gap-6 md:grid-cols-4 transition-all duration-500 ${settings?.automation_enabled ? "opacity-100" : "opacity-40 grayscale pointer-events-none"}`}>
                    
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Trial Length</label>
                        <div className="relative group/input">
                             <input
                                type="number"
                                min={1}
                                value={settings?.trial_length_days}
                                onChange={(e) => updateField("trial_length_days", Number(e.target.value))}
                                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-white text-center font-mono outline-none transition-all focus:border-white/30 focus:bg-white/[0.05]"
                            />
                        </div>
                    </div>

                    <div className="relative space-y-2">
                        <div className="hidden md:block absolute -left-3 top-9 h-px w-3 bg-zinc-800" />
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">1st Nudge</label>
                        <input
                            type="number"
                            min={1}
                            value={settings?.inactivity_days_nudge1}
                            onChange={(e) => updateField("inactivity_days_nudge1", Number(e.target.value))}
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-white text-center font-mono outline-none transition-all focus:border-blue-500/50 focus:bg-blue-500/[0.1] focus:shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                        />
                    </div>

                    <div className="relative space-y-2">
                        <div className="hidden md:block absolute -left-3 top-9 h-px w-3 bg-zinc-800" />
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">2nd Nudge</label>
                        <input
                            type="number"
                            min={1}
                            value={settings?.inactivity_days_nudge2}
                            onChange={(e) => updateField("inactivity_days_nudge2", Number(e.target.value))}
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-white text-center font-mono outline-none transition-all focus:border-purple-500/50 focus:bg-purple-500/[0.1] focus:shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                        />
                    </div>

                    <div className="relative space-y-2">
                        <div className="hidden md:block absolute -left-3 top-9 h-px w-3 bg-zinc-800" />
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Final Nudge</label>
                        <input
                            type="number"
                            min={1}
                            value={settings?.inactivity_days_nudge3}
                            onChange={(e) => updateField("inactivity_days_nudge3", Number(e.target.value))}
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-white text-center font-mono outline-none transition-all focus:border-red-500/50 focus:bg-red-500/[0.1] focus:shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                        />
                    </div>

                 </div>
              </div>
            </div>

         </div>
      </main>
    </div>
  );
}
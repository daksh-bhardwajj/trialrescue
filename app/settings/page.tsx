/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useCurrentProject } from "../hooks/useCurrentProject";
import { 
  Save, 
  Globe, 
  Zap, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Settings2
} from "lucide-react";

type Settings = {
  app_url: string;
  trial_length_days: number;
  inactivity_days_nudge1: number;
  inactivity_days_nudge2: number;
  inactivity_days_nudge3: number;
  automation_enabled: boolean;
};

export default function SettingsPage() {
  const { projectId, loading: loadingProject, error: projectError } = useCurrentProject();

  const [settings, setSettings] = useState<Settings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Load settings for THIS project
  useEffect(() => {
    if (!projectId) return;

    async function load() {
      try {
        setLoadingSettings(true);
        const res = await fetch(`/api/project/settings?projectId=${projectId}`);
        if (!res.ok) throw new Error("Failed to load settings");
        const json = await res.json();
        setSettings(json);
      } catch (err) {
        console.error(err);
        setError("Could not load project settings");
      } finally {
        setLoadingSettings(false);
      }
    }

    load();
  }, [projectId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!settings || !projectId) return;
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch(`/api/project/settings?projectId=${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          app_url: settings.app_url,
          trial_length_days: Number(settings.trial_length_days),
          inactivity_days_nudge1: Number(settings.inactivity_days_nudge1),
          inactivity_days_nudge2: Number(settings.inactivity_days_nudge2),
          inactivity_days_nudge3: Number(settings.inactivity_days_nudge3),
          automation_enabled: settings.automation_enabled,
        }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Failed to save settings");
      }

      setSaved(true);
      
      // Reset saved state after 3 seconds for cleaner UI
      setTimeout(() => setSaved(false), 3000);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  function update<K extends keyof Settings>(field: K, value: Settings[K]) {
    setSettings((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  // --- Loading State (Consistent Overlay) ---
  if (loadingProject || (loadingSettings && !settings)) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]">
         <div className="pointer-events-none absolute inset-0 opacity-[0.1]">
            <div className="h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
         </div>
         <div className="relative flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-500">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.08] shadow-2xl backdrop-blur-md">
               <Settings2 size={24} className="relative z-10 text-white animate-spin duration-[3000ms]" />
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-600 animate-pulse">
               Loading Configuration
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

  // --- Main UI ---
  return (
    <div className="flex min-h-screen w-full bg-[#050505] font-sans selection:bg-white/20">
      
      {/* Background Grid */}
      <div className="pointer-events-none fixed inset-0 z-0 flex justify-center opacity-[0.15]">
        <div className="h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto px-6 py-8 md:px-12 md:py-10">
        <div className="mx-auto max-w-3xl space-y-8">
          
          {/* Header */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-widest text-zinc-500">
              <span className="h-px w-8 bg-zinc-800"></span>
              Configuration
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Trial & Automation
            </h1>
            <p className="text-[13px] text-zinc-400 max-w-lg">
              Manage your application's trial duration and configure the automated email nudges sent to inactive users.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Card: General Settings */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0A0A0A] p-6 md:p-8 backdrop-blur-sm">
              <div className="mb-6 flex items-center gap-2 border-b border-white/[0.04] pb-4">
                <Globe size={16} className="text-zinc-500" />
                <h3 className="text-sm font-semibold text-zinc-200">Application Details</h3>
              </div>
              
              <div className="space-y-3">
                <label className="text-[13px] font-medium text-zinc-300">App URL</label>
                <div className="group relative">
                  <input
                    type="url"
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 pl-11 text-sm text-white placeholder:text-zinc-700 outline-none transition-all focus:border-white/20 focus:bg-white/[0.02] focus:ring-1 focus:ring-white/20"
                    value={settings?.app_url || ""}
                    onChange={(e) => update("app_url", e.target.value)}
                    placeholder="https://app.yoursaas.com"
                    required
                  />
                  <Globe size={16} className="absolute left-4 top-3.5 text-zinc-600 transition-colors group-focus-within:text-white" />
                </div>
                <p className="text-[11px] text-zinc-500">
                  Users are redirected here when clicking "Open my trial" in rescue emails.
                </p>
              </div>
            </div>

            {/* Card: Timeline Configuration */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0A0A0A] p-6 md:p-8 backdrop-blur-sm">
               <div className="mb-6 flex items-center gap-2 border-b border-white/[0.04] pb-4">
                <Clock size={16} className="text-zinc-500" />
                <h3 className="text-sm font-semibold text-zinc-200">Timeline & Nudges</h3>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Trial Length */}
                <div className="space-y-2">
                   <label className="text-[12px] font-medium text-zinc-400">Total Trial Length</label>
                   <div className="relative group">
                      <input
                        type="number"
                        min={1}
                        max={365}
                        className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none transition-all focus:border-emerald-500/50 focus:bg-emerald-500/[0.05]"
                        value={settings?.trial_length_days}
                        onChange={(e) => update("trial_length_days", Number(e.target.value) || 0)}
                      />
                      <Calendar size={14} className="absolute right-3 top-3 text-zinc-600 pointer-events-none" />
                   </div>
                   <span className="text-[10px] text-zinc-600">Days total</span>
                </div>

                {/* Nudge 1 */}
                <div className="space-y-2 relative">
                   <div className="absolute -left-3 top-8 hidden h-px w-3 bg-zinc-800 md:block"></div>
                   <label className="text-[12px] font-medium text-zinc-400">1st Nudge</label>
                   <input
                        type="number"
                        min={1}
                        max={365}
                        className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none transition-all focus:border-blue-500/50 focus:bg-blue-500/[0.05]"
                        value={settings?.inactivity_days_nudge1}
                        onChange={(e) => update("inactivity_days_nudge1", Number(e.target.value) || 0)}
                    />
                    <span className="text-[10px] text-zinc-600">Days inactive</span>
                </div>

                {/* Nudge 2 */}
                <div className="space-y-2 relative">
                   <div className="absolute -left-3 top-8 hidden h-px w-3 bg-zinc-800 lg:block"></div>
                   <label className="text-[12px] font-medium text-zinc-400">2nd Nudge</label>
                   <input
                        type="number"
                        min={1}
                        max={365}
                        className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none transition-all focus:border-purple-500/50 focus:bg-purple-500/[0.05]"
                        value={settings?.inactivity_days_nudge2}
                        onChange={(e) => update("inactivity_days_nudge2", Number(e.target.value) || 0)}
                    />
                    <span className="text-[10px] text-zinc-600">Days inactive</span>
                </div>

                 {/* Nudge 3 */}
                 <div className="space-y-2 relative">
                   <div className="absolute -left-3 top-8 hidden h-px w-3 bg-zinc-800 lg:block"></div>
                   <label className="text-[12px] font-medium text-zinc-400">Final Nudge</label>
                   <input
                        type="number"
                        min={1}
                        max={365}
                        className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none transition-all focus:border-red-500/50 focus:bg-red-500/[0.05]"
                        value={settings?.inactivity_days_nudge3}
                        onChange={(e) => update("inactivity_days_nudge3", Number(e.target.value) || 0)}
                    />
                    <span className="text-[10px] text-zinc-600">Days inactive</span>
                </div>
              </div>
            </div>

            {/* Card: Automation Toggle */}
            <div className={`relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 ${
              settings?.automation_enabled 
                ? "border-emerald-500/20 bg-emerald-950/[0.05]" 
                : "border-white/[0.08] bg-[#0A0A0A]"
            }`}>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Zap size={16} className={settings?.automation_enabled ? "text-emerald-400" : "text-zinc-500"} />
                    <h3 className="text-sm font-semibold text-zinc-200">Email Automation</h3>
                  </div>
                  <p className="text-[12px] text-zinc-500 max-w-sm">
                    When enabled, we will automatically send emails to users matching the criteria above.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => update("automation_enabled", !settings?.automation_enabled)}
                  className={`relative h-7 w-12 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-black ${
                    settings?.automation_enabled ? "bg-emerald-500" : "bg-zinc-800"
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-lg transition-all duration-300 ${
                      settings?.automation_enabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] text-red-200">
                <AlertCircle size={14} className="shrink-0" />
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 border-t border-white/[0.08] pt-6">
               {saved && (
                  <div className="flex items-center gap-2 text-[12px] text-emerald-400 animate-in fade-in slide-in-from-right-4 duration-500">
                     <CheckCircle2 size={14} />
                     <span>Changes saved successfully</span>
                  </div>
               )}
               
               <button
                type="submit"
                disabled={saving}
                className="group relative flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-[13px] font-semibold text-black transition-all hover:bg-zinc-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 disabled:opacity-70 disabled:active:scale-100"
              >
                {saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Save Configuration
                    <Save size={14} className="opacity-60 transition-transform group-hover:scale-110" />
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
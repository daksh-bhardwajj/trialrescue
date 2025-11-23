/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useCurrentProject } from "../hooks/useCurrentProject";

type Settings = {
  app_url: string;
  trial_length_days: number;
  inactivity_days_nudge1: number;
  inactivity_days_nudge2: number;
  inactivity_days_nudge3: number;
  automation_enabled: boolean;
};

export default function SettingsPage() {
  const { projectId, loading: loadingProject, error: projectError } =
    useCurrentProject();

  const [settings, setSettings] = useState<Settings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Load settings for THIS project
  useEffect(() => {
    if (!projectId) return; // don’t fetch until we have projectId

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

  // Guard: still resolving which project this user owns
  if (loadingProject) {
    return (
      <div className="flex-1 px-4 md:px-6 py-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-400">
          Loading your project…
        </div>
      </div>
    );
  }

  // Guard: no project / error
  if (projectError || !projectId) {
    return (
      <div className="flex-1 px-4 md:px-6 py-6">
        <div className="rounded-2xl border border-rose-800/60 bg-rose-950/40 p-4 text-sm text-rose-200">
          {projectError || "No project found for this account."}
        </div>
      </div>
    );
  }

  // Guard: settings still loading
  if (loadingSettings || !settings) {
    return (
      <div className="flex-1 px-4 md:px-6 py-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-400">
          Loading project settings…
        </div>
      </div>
    );
  }

  // Actual UI
  return (
    <div className="flex-1 px-4 md:px-6 py-6 space-y-4 overflow-y-auto scrollbar-thin">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
            Project
          </div>
          <h1 className="text-lg md:text-xl font-semibold text-slate-50">
            Trial & automation settings
          </h1>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 md:p-5"
      >
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-200">
            App URL
          </label>
          <p className="text-[11px] text-slate-500 mb-1">
            Users will be sent here when they click “Open my trial” in the email.
          </p>
          <input
            type="url"
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
            value={settings.app_url || ""}
            onChange={(e) => update("app_url", e.target.value)}
            placeholder="https://your-saas-app.com/dashboard"
            required
          />
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-200">
              Trial length (days)
            </label>
            <input
              type="number"
              min={1}
              max={365}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
              value={settings.trial_length_days}
              onChange={(e) =>
                update("trial_length_days", Number(e.target.value) || 0)
              }
            />
            <p className="text-[11px] text-slate-500">
              Used for future features (e.g. end-of-trial campaigns).
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-200">
              Nudge 1 after (days)
            </label>
            <input
              type="number"
              min={1}
              max={365}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
              value={settings.inactivity_days_nudge1}
              onChange={(e) =>
                update("inactivity_days_nudge1", Number(e.target.value) || 0)
              }
            />
            <p className="text-[11px] text-slate-500">
              First reminder after inactivity.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-200">
              Nudge 2 after (days)
            </label>
            <input
              type="number"
              min={1}
              max={365}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
              value={settings.inactivity_days_nudge2}
              onChange={(e) =>
                update("inactivity_days_nudge2", Number(e.target.value) || 0)
              }
            />
            <p className="text-[11px] text-slate-500">
              Second reminder for still-inactive users.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-200">
              Nudge 3 after (days)
            </label>
            <input
              type="number"
              min={1}
              max={365}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
              value={settings.inactivity_days_nudge3}
              onChange={(e) =>
                update("inactivity_days_nudge3", Number(e.target.value) || 0)
              }
            />
            <p className="text-[11px] text-slate-500">
              Final reminder before the trial fully goes cold.
            </p>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2.5">
          <div>
            <div className="text-xs font-medium text-slate-200">
              Automation
            </div>
            <div className="text-[11px] text-slate-500">
              When enabled, TrialRescue will send emails automatically.
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              update("automation_enabled", !settings.automation_enabled)
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full border transition ${
              settings.automation_enabled
                ? "border-emerald-500 bg-emerald-500/20"
                : "border-slate-600 bg-slate-900"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-slate-100 shadow transition ${
                settings.automation_enabled ? "translate-x-5" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {error && (
          <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-800/60 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center rounded-xl border border-cyan-500/60 bg-cyan-500/20 px-4 py-2 text-xs font-medium text-cyan-100 hover:bg-cyan-500/30 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save settings"}
          </button>
          {saved && !error && (
            <span className="text-[11px] text-emerald-400">
              Saved. New settings will be used on the next sweep.
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
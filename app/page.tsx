"use client";

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useCurrentProject } from "./hooks/useCurrentProject";

type DashboardSummary = {
  trials_last_30: number;
  nudged_users: number;
  upgrades_from_rescued: number;
};

function StatCard(props: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 flex flex-col gap-1">
      <div className="text-xs text-slate-400">{props.label}</div>
      <div className="text-xl font-semibold text-slate-50">
        {props.value}
      </div>
      {props.helper && (
        <div className="text-[11px] text-slate-500">{props.helper}</div>
      )}
    </div>
  );
}

export default function Page() {
  const router = useRouter();
  const { projectId, loading: loadingProject, error: projectError } =
    useCurrentProject();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

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
    async function loadSummary() {
      try {
        const res = await fetch(`/api/dashboard/summary?projectId=${projectId}`);
        if (!res.ok) throw new Error("Failed to load dashboard summary");
        const data = await res.json();
        setSummary(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSummary(false);
      }
    }
    loadSummary();
  }, [projectId]);

  if (loadingProject) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400 text-sm">
        Loading your project…
      </div>
    );
  }

  if (projectError || !projectId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400 text-sm">
        {projectError || "No project found. Try signing out and back in."}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      {/* Very simple sidebar */}
      <aside className="hidden md:flex w-56 flex-col border-r border-slate-900 bg-slate-950/90 p-4 gap-3">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-7 w-7 rounded-full border border-cyan-500/60 flex items-center justify-center text-[11px] text-cyan-400">
            TR
          </div>
          <div>
            <div className="text-sm font-semibold">TrialRescue</div>
            <div className="text-[11px] text-slate-500">
              Convert before they churn
            </div>
          </div>
        </div>

        <Link
          href="/"
          className="text-xs rounded-lg px-2 py-1.5 bg-slate-900 border border-slate-700 text-slate-100"
        >
          Dashboard
        </Link>
        <Link
          href="/integration"
          className="text-xs rounded-lg px-2 py-1.5 text-slate-400 hover:bg-slate-900"
        >
          Event tracking
        </Link>
        <Link
          href="/settings"
          className="text-xs rounded-lg px-2 py-1.5 text-slate-400 hover:bg-slate-900"
        >
          Project settings
        </Link>

        {/* Logout at bottom */}
        <div className="mt-auto pt-4 border-t border-slate-900">
          <button
            onClick={handleLogout}
            className="w-full text-xs rounded-lg px-2 py-1.5 text-slate-400 hover:bg-slate-900 text-left"
          >
            Log out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 px-4 md:px-6 py-6 space-y-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
              Overview
            </div>
            <h1 className="text-lg md:text-xl font-semibold text-slate-50">
              Trial performance
            </h1>
            <p className="mt-1 text-xs text-slate-500 max-w-xl">
              These numbers are based on events sent from your SaaS via the TrialRescue
              API. No simulations, only real data.
            </p>
          </div>
          <Link
            href="/integration"
            className="hidden md:inline-flex items-center rounded-xl border border-cyan-500/60 bg-cyan-500/20 px-3 py-1.5 text-xs font-medium text-cyan-100 hover:bg-cyan-500/30"
          >
            View integration guide
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            label="Trials started (30d)"
            value={
              loadingSummary
                ? "..."
                : String(summary?.trials_last_30 ?? 0)
            }
            helper="New trial users we’ve seen in the last 30 days."
          />
          <StatCard
            label="Users nudged"
            value={
              loadingSummary
                ? "..."
                : String(summary?.nudged_users ?? 0)
            }
            helper="Unique trial users who received at least one email."
          />
          <StatCard
            label="Upgrades after nudges"
            value={
              loadingSummary
                ? "..."
                : String(summary?.upgrades_from_rescued ?? 0)
            }
            helper="Users who upgraded after receiving nudges."
          />
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <div className="text-xs font-medium text-slate-200 mb-1">
            What to do next
          </div>
          <ul className="text-[11px] text-slate-500 space-y-1">
            <li>
              1. Go to <span className="font-mono text-slate-300">Integration</span> and
              send a test event.
            </li>
            <li>
              2. Wire <span className="font-mono text-slate-300">user_signed_up</span>,{" "}
              <span className="font-mono text-slate-300">user_activity</span>, and{" "}
              <span className="font-mono text-slate-300">user_upgraded</span> from your
              backend.
            </li>
            <li>
              3. Let TrialRescue run for a few days and watch these stats move.
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
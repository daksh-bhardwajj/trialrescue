/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useCurrentProject } from "./hooks/useCurrentProject";
import {
  LayoutDashboard,
  Activity,
  Settings,
  LogOut,
  Zap,
  ChevronRight,
  BarChart3,
  Users,
  ArrowUpRight,
  Layers
} from "lucide-react";

// --- Types ---
type DashboardSummary = {
  trials_last_30: number;
  nudged_users: number;
  upgrades_from_rescued: number;
};

// --- UI Components ---

function SidebarItem({
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
      className={`group flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-all duration-200 ease-in-out ${
        isActive
          ? "bg-white/10 text-white shadow-[0_1px_0_0_rgba(255,255,255,0.1)_inset]"
          : "text-zinc-500 hover:bg-white/5 hover:text-zinc-200"
      }`}
    >
      <Icon
        size={16}
        className={`transition-colors ${
          isActive ? "text-white" : "text-zinc-600 group-hover:text-zinc-300"
        }`}
      />
      {label}
    </Link>
  );
}

function StatCard({
  label,
  value,
  helper,
  loading,
  icon: Icon,
}: {
  label: string;
  value: string;
  helper?: string;
  loading?: boolean;
  icon?: any;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 shadow-sm transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.04] hover:shadow-md">
      {/* Gradient Glow Effect on Hover */}
      <div className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">
            {label}
          </span>
          {Icon && <Icon size={16} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />}
        </div>

        <div className="flex flex-col gap-1">
          {loading ? (
            <div className="h-8 w-24 animate-pulse rounded bg-white/10" />
          ) : (
            <div className="text-3xl font-semibold tracking-tight text-white">
              {value}
            </div>
          )}
          {helper && (
            <div className="text-[12px] text-zinc-600 group-hover:text-zinc-500 transition-colors">
              {helper}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const router = useRouter();
  const pathname = usePathname();
  const { projectId, loading: loadingProject, error: projectError } = useCurrentProject();
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

  // --- NEW: Loading State (Fixed Overlay) ---
  if (loadingProject) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]">
         {/* Background Grid for consistency */}
         <div className="pointer-events-none absolute inset-0 opacity-[0.1]">
            <div className="h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
         </div>
         
         <div className="relative flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-500">
            {/* Logo Container with Glow */}
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.08] shadow-2xl backdrop-blur-md">
               <div className="absolute inset-0 bg-white/10 blur-xl rounded-full animate-pulse" />
               <Zap size={24} className="relative z-10 text-white fill-white/20 animate-pulse duration-1000" />
            </div>
            
            <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-600 animate-pulse">
               Initializing
            </div>
         </div>
      </div>
    );
  }

  // --- Error State ---
  if (projectError || !projectId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] text-zinc-400">
        <div className="rounded-lg border border-red-900/30 bg-red-950/10 px-6 py-4 text-sm backdrop-blur-md">
          {projectError || "No project found. Please sign in again."}
        </div>
      </div>
    );
  }

  // --- Main Dashboard UI ---
  return (
    <div className="flex min-h-screen w-full bg-[#050505] font-sans selection:bg-white/20">
      
      {/* Subtle Grid Background */}
      <div className="pointer-events-none fixed inset-0 z-0 flex justify-center opacity-[0.15]">
        <div className="h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-col justify-between border-r border-white/[0.06] bg-[#050505]/80 px-4 py-6 backdrop-blur-xl md:flex z-20">
        <div className="flex flex-col gap-8">
          {/* Logo Area */}
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]">
               <Zap size={16} fill="currentColor" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-white">TrialRescue</div>
              <div className="text-[10px] font-medium text-zinc-500">Pro Plan</div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1">
            <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-600">
              Platform
            </div>
            <SidebarItem 
              href="/" 
              icon={LayoutDashboard} 
              label="Overview" 
              isActive={pathname === "/"} 
            />
            <SidebarItem 
              href="/integration" 
              icon={Layers} 
              label="Integration" 
              isActive={pathname === "/integration"} 
            />
            <SidebarItem 
              href="/settings" 
              icon={Settings} 
              label="Settings" 
              isActive={pathname === "/settings"} 
            />
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="flex flex-col gap-4 border-t border-white/[0.06] pt-4">
            <button
            onClick={handleLogout}
            className="group flex w-full items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
            >
            <LogOut size={16} className="opacity-70" />
            Sign out
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative z-10 flex-1 overflow-y-auto px-6 py-8 md:px-12 md:py-10">
        <div className="mx-auto max-w-5xl space-y-10">
          
          {/* Header Section */}
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-widest text-zinc-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                Live Data
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                Performance
              </h1>
              <p className="max-w-lg text-[13px] leading-relaxed text-zinc-400">
                Real-time metrics from your SaaS integration. Track trials, engagement, and rescue conversions.
              </p>
            </div>

            <Link
              href="/integration"
              className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-[13px] font-medium text-white backdrop-blur-sm transition-all hover:bg-white/[0.08] hover:pr-4 hover:pl-6 active:scale-95"
            >
              Integration Guide
              <ChevronRight size={14} className="text-zinc-500 transition-transform group-hover:translate-x-0.5 group-hover:text-white" />
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-5 md:grid-cols-3">
            <StatCard
              icon={Users}
              label="Trials Started (30d)"
              loading={loadingSummary}
              value={String(summary?.trials_last_30 ?? 0)}
              helper="New unique trials detected."
            />
            <StatCard
              icon={Activity}
              label="Users Nudged"
              loading={loadingSummary}
              value={String(summary?.nudged_users ?? 0)}
              helper="Users receiving rescue emails."
            />
            <StatCard
              icon={BarChart3}
              label="Rescued Upgrades"
              loading={loadingSummary}
              value={String(summary?.upgrades_from_rescued ?? 0)}
              helper="Conversions post-nudge."
            />
          </div>

          {/* Onboarding / Next Steps Panel */}
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0A0A0A] p-8">
            <div className="absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/2 bg-white/[0.02] blur-[80px] rounded-full pointer-events-none" />
            
            <h2 className="mb-6 text-sm font-semibold text-zinc-200">
                Implementation Checklist
            </h2>
            
            <div className="space-y-4">
              {[
                {
                    step: 1,
                    text: "Send a test event from your backend",
                    link: "Integration Docs",
                    href: "/integration"
                },
                {
                    step: 2,
                    text: "Wire up 'user_signed_up' & 'user_activity'",
                    code: true
                },
                {
                    step: 3,
                    text: "Analyze incoming stats for 24-48 hours",
                }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 group">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-[10px] font-bold text-zinc-500 shadow-sm group-hover:border-white/20 group-hover:text-zinc-300 transition-colors">
                        {item.step}
                    </div>
                    <div className="pt-0.5 text-[13px] text-zinc-400 leading-relaxed">
                        {item.text} 
                        {item.link && (
                             <Link href={item.href || "#"} className="ml-2 inline-flex items-center text-white hover:underline decoration-zinc-700 underline-offset-4">
                                {item.link} <ArrowUpRight size={10} className="ml-0.5 opacity-50" />
                             </Link>
                        )}
                    </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
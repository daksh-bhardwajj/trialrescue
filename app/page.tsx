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
  Layers,
  CheckCircle2,
  Sparkles
} from "lucide-react";

// --- Types ---
type DashboardSummary = {
  trials_last_30: number;
  nudged_users: number;
  upgrades_from_rescued: number;
};

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

function StatCard({
  label,
  value,
  helper,
  loading,
  icon: Icon,
  index,
}: {
  label: string;
  value: string;
  helper?: string;
  loading?: boolean;
  icon?: any;
  index: number;
}) {
  return (
    <div 
      className="group relative overflow-hidden rounded-[24px] border border-white/[0.06] bg-[#121212]/40 p-6 backdrop-blur-xl transition-all duration-500 ease-out hover:scale-[1.02] hover:bg-[#121212]/60 hover:shadow-2xl"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Dynamic Background Glow */}
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/[0.02] blur-[50px] transition-all duration-700 group-hover:bg-white/[0.05]" />
      
      <div className="relative z-10 flex flex-col justify-between h-full gap-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
             <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.05] border border-white/[0.05] shadow-inner text-zinc-400 transition-colors group-hover:text-white">
                <Icon size={14} />
             </div>
             <span className="text-[13px] font-semibold text-zinc-400 group-hover:text-zinc-200 transition-colors">
                {label}
             </span>
          </div>
        </div>

        <div>
          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-white/[0.08]" />
          ) : (
            <div className="flex items-baseline gap-1">
                <div className="text-4xl font-bold tracking-tight text-white drop-shadow-sm">
                  {value}
                </div>
            </div>
          )}
          {helper && (
            <div className="mt-2 text-[12px] font-medium leading-relaxed text-zinc-600 transition-colors group-hover:text-zinc-500">
              {helper}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChecklistItem({ step, title, link, href, isLast }: { step: number, title: string, link?: string, href?: string, isLast?: boolean }) {
    return (
        <div className="relative flex gap-4 group">
            {!isLast && (
                <div className="absolute left-[11px] top-8 bottom-0 w-[1px] bg-gradient-to-b from-white/10 to-transparent" />
            )}
            <div className="relative shrink-0">
                <div className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-black/50 text-[10px] font-bold text-zinc-500 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all duration-300 group-hover:border-emerald-500/50 group-hover:text-emerald-400 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    {step}
                </div>
            </div>
            <div className="pb-8 pt-0.5">
                <h4 className="text-[13px] font-medium text-zinc-300 transition-colors group-hover:text-white">
                    {title}
                </h4>
                {link && (
                    <Link href={href || "#"} className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-blue-400 transition-all hover:text-blue-300 hover:translate-x-1">
                        {link} <ArrowUpRight size={10} />
                    </Link>
                )}
            </div>
        </div>
    )
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

  // --- iOS Style Loading State ---
  if (loadingProject) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
         <div className="relative flex flex-col items-center justify-center">
            {/* Pulsing Aura */}
            <div className="absolute inset-0 -z-10 animate-ping rounded-full bg-white/5 opacity-20 duration-1000" />
            
            <div className="relative flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gradient-to-tr from-zinc-800 to-zinc-900 shadow-[0_0_40px_-10px_rgba(255,255,255,0.1)] ring-1 ring-white/10">
               <Zap size={32} className="text-white fill-white animate-pulse" />
            </div>
            
            <div className="mt-8 flex flex-col items-center gap-2">
                <h2 className="text-lg font-medium text-white tracking-tight">TrialRescue</h2>
                <div className="h-1 w-24 overflow-hidden rounded-full bg-zinc-900">
                    <div className="h-full w-full origin-left animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                </div>
            </div>
         </div>
      </div>
    );
  }

  if (projectError || !projectId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-zinc-400">
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-zinc-900/50 p-8 backdrop-blur-xl">
          <div className="rounded-full bg-red-500/10 p-3 text-red-400">
              <LogOut size={20} />
          </div>
          <p className="text-sm font-medium">{projectError || "Session expired."}</p>
          <button onClick={() => router.push('/auth')} className="text-xs text-white underline decoration-zinc-600 underline-offset-4">Return to login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-black font-sans text-zinc-100 selection:bg-white/20 overflow-hidden">
      
      {/* Ambient Background */}
      <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-white/[0.03] blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-blue-500/[0.02] blur-[120px]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      {/* Sidebar - "Floating Dock" Style */}
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
                    <NavItem href="/" icon={LayoutDashboard} label="Overview" isActive={pathname === "/"} />
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
         <div className="mx-auto max-w-6xl animate-in slide-in-from-bottom-8 fade-in duration-700">
            
            {/* Top Bar */}
            <header className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div>
                   <div className="flex items-center gap-2 mb-2">
                      <span className="flex h-2 w-2 relative">
                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                         <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">System Online</span>
                   </div>
                   <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-lg">Dashboard</h1>
                </div>

                <Link
                  href="/integration"
                  className="group relative flex items-center gap-2 overflow-hidden rounded-full bg-white px-6 py-2.5 text-[13px] font-bold text-black transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  <span className="relative z-10 flex items-center gap-2">
                     Integration Guide
                     <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </span>
                  <div className="absolute inset-0 -z-0 bg-gradient-to-r from-zinc-200 to-white opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
            </header>

            {/* Metrics */}
            <section className="mb-8 grid gap-4 md:grid-cols-3">
               <StatCard 
                 index={1}
                 icon={Users}
                 label="New Trials" 
                 value={String(summary?.trials_last_30 ?? 0)} 
                 loading={loadingSummary}
                 helper="Last 30 days activity"
               />
               <StatCard 
                 index={2}
                 icon={Activity}
                 label="Users Nudged" 
                 value={String(summary?.nudged_users ?? 0)} 
                 loading={loadingSummary}
                 helper="Engagement emails sent"
               />
               <StatCard 
                 index={3}
                 icon={BarChart3}
                 label="Rescued" 
                 value={String(summary?.upgrades_from_rescued ?? 0)} 
                 loading={loadingSummary}
                 helper="Recovered revenue conversions"
               />
            </section>

            {/* Bottom Section: Checklist & Info */}
            <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
               
               {/* Setup Checklist */}
               <div className="rounded-[32px] border border-white/[0.06] bg-[#121212]/40 p-8 backdrop-blur-xl">
                   <div className="mb-6 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.05] text-white">
                             <CheckCircle2 size={20} />
                         </div>
                         <div>
                            <h3 className="text-lg font-semibold text-white">Quick Setup</h3>
                            <p className="text-[12px] text-zinc-500">Complete these steps to activate automation</p>
                         </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">0% Complete</span>
                   </div>

                   <div className="pl-2">
                       <ChecklistItem 
                          step={1} 
                          title="Send a test event from your backend" 
                          link="Read Documentation" 
                          href="/integration" 
                       />
                       <ChecklistItem 
                          step={2} 
                          title="Wire up 'user_signed_up' & 'user_activity'" 
                       />
                       <ChecklistItem 
                          step={3} 
                          title="Analyze incoming stats for 24-48 hours" 
                          isLast
                       />
                   </div>
               </div>

               {/* Hint Card */}
               <div className="relative overflow-hidden rounded-[32px] border border-white/[0.06] bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-8 backdrop-blur-xl">
                   <div className="relative z-10 h-full flex flex-col justify-between">
                      <div>
                          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-200">
                             Pro Tip
                          </div>
                          <h3 className="text-xl font-semibold text-white leading-tight">
                              Recovery works best when automated.
                          </h3>
                          <p className="mt-3 text-[13px] text-zinc-400 leading-relaxed">
                              TrialRescue automatically filters out users who have upgraded, so you never spam paying customers.
                          </p>
                      </div>
                      <div className="mt-8">
                         <Link href="/settings" className="text-[13px] font-medium text-white hover:underline decoration-white/30 underline-offset-4">
                            Configure Rules &rarr;
                         </Link>
                      </div>
                   </div>
                   
                   {/* Decorative Blob */}
                   <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-blue-500/20 blur-[80px]" />
               </div>

            </div>
         </div>
      </main>
    </div>
  );
}
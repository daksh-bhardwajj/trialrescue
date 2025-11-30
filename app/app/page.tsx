/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useCurrentProject } from "@/app/hooks/useCurrentProject";
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
  Sparkles,
  Lock,
  CreditCard,
  User,
  ArrowRight,
} from "lucide-react";

// --- Constants ---
const DODO_CHECKOUT_URL = "https://test.checkout.dodopayments.com/buy/pdt_QfENHSfu1kRvmtdToiUng?quantity=1&redirect_url=https://www.trialrescue.vercel.app%2Fapp%2Fbilling%2Fsuccess";

// --- Types ---
type DashboardSummary = {
  trials_last_30: number;
  nudged_users: number;
  upgrades_from_rescued: number;
};

type BillingInfo = {
  id: string;
  billing_status: string | null;
  billing_plan: string | null;
  billing_updated_at?: string | null;
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
      className="group relative overflow-hidden rounded-[24px] border border-white/[0.06] bg-[#0A0A0A] p-6 transition-all duration-500 hover:border-white/[0.1] hover:bg-[#0F0F0F] hover:shadow-2xl"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative z-10 flex h-full flex-col justify-between gap-6">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">
            {label}
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.03] border border-white/[0.05] text-zinc-500 group-hover:text-white transition-colors">
            <Icon size={14} />
          </div>
        </div>

        <div>
          {loading ? (
            <div className="h-8 w-24 animate-pulse rounded-md bg-white/[0.05]" />
          ) : (
            <div className="text-4xl font-bold tracking-tight text-white">
              {value}
            </div>
          )}
          {helper && (
            <div className="mt-2 text-[11px] font-medium text-zinc-600 group-hover:text-zinc-500 transition-colors">
              {helper}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChecklistItem({
  step,
  title,
  link,
  href,
  isLast,
}: {
  step: number;
  title: string;
  link?: string;
  href?: string;
  isLast?: boolean;
}) {
  return (
    <div className="group relative flex gap-4">
      {!isLast && (
        <div className="absolute left-[11px] top-8 bottom-0 w-[1px] bg-gradient-to-b from-white/10 to-transparent" />
      )}
      <div className="relative shrink-0">
        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-black text-[10px] font-bold text-zinc-500 shadow-inner transition-all duration-300 group-hover:border-emerald-500/50 group-hover:text-emerald-400 group-hover:scale-110">
          {step}
        </div>
      </div>
      <div className="pb-8 pt-0.5">
        <h4 className="text-[13px] font-medium text-zinc-300 transition-colors group-hover:text-white">
          {title}
        </h4>
        {link && (
          <Link
            href={href || "#"}
            className="mt-1 inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
          >
            {link} <ArrowUpRight size={10} />
          </Link>
        )}
      </div>
    </div>
  );
}

// --- Paid dashboard content ---

function PaidDashboard({
  summary,
  loadingSummary,
}: {
  summary: DashboardSummary | null;
  loadingSummary: boolean;
}) {
  return (
    <div className="mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Top Bar */}
      <header className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end border-b border-white/[0.06] pb-8">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Operational
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Performance
          </h1>
        </div>

        <Link
          href="/integration"
          className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2 text-[12px] font-medium text-zinc-200 transition-all hover:bg-white/[0.08] active:scale-95"
        >
          Integration Guide
          <ChevronRight
            size={14}
            className="text-zinc-500 transition-transform group-hover:translate-x-0.5 group-hover:text-white"
          />
        </Link>
      </header>

      {/* Metrics */}
      <section className="mb-8 grid gap-4 md:grid-cols-3">
        <StatCard
          index={1}
          icon={Users}
          label="Total Trials"
          value={String(summary?.trials_last_30 ?? 0)}
          loading={loadingSummary}
          helper="Signups detected via API"
        />
        <StatCard
          index={2}
          icon={Activity}
          label="Nudges Sent"
          value={String(summary?.nudged_users ?? 0)}
          loading={loadingSummary}
          helper="Automated engagement emails"
        />
        <StatCard
          index={3}
          icon={BarChart3}
          label="Recovered"
          value={String(summary?.upgrades_from_rescued ?? 0)}
          loading={loadingSummary}
          helper="Users converted after nudge"
        />
      </section>

      {/* Bottom Section */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-[24px] border border-white/[0.06] bg-[#0A0A0A] p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05] text-white border border-white/[0.05]">
              <CheckCircle2 size={16} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Integration Status
              </h3>
              <p className="text-[11px] text-zinc-500">
                Setup steps to reach 100% automation.
              </p>
            </div>
          </div>

          <div className="pl-1">
            <ChecklistItem
              step={1}
              title="Send a test event from your backend"
              link="Documentation"
              href="/integration"
            />
            <ChecklistItem
              step={2}
              title="Wire up 'user_signed_up' & 'user_activity'"
            />
            <ChecklistItem
              step={3}
              title="Monitor incoming traffic for 24 hours"
              isLast
            />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[24px] border border-white/[0.06] bg-[#0A0A0A] p-8">
          <div className="absolute top-0 right-0 p-8 opacity-10">
             <Sparkles size={120} className="text-white" />
          </div>
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-300 border border-white/5">
                Pro Tip
              </div>
              <h3 className="text-lg font-semibold text-white leading-snug">
                Recovery works best on autopilot.
              </h3>
              <p className="mt-3 text-[12px] text-zinc-500 leading-relaxed">
                We automatically filter out users who have upgraded, ensuring you never spam your paying customers.
              </p>
            </div>
            <div className="mt-8">
              <Link
                href="/settings"
                className="text-[12px] font-medium text-white underline decoration-zinc-700 underline-offset-4 hover:decoration-white transition-all"
              >
                Configure Rules &rarr;
              </Link>
            </div>
          </div>
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

  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [loadingBilling, setLoadingBilling] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  async function handleLogout() {
    try {
      await supabaseBrowser.auth.signOut();
      router.push("/auth");
    } catch (err) {
      console.error("Error signing out", err);
    }
  }

  // Fetch User Email
  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      if (user?.email) setUserEmail(user.email);
    }
    getUser();
  }, []);

  useEffect(() => {
    if (!projectId) return;
    async function loadSummary() {
      try {
        const res = await fetch(
          `/api/dashboard/summary?projectId=${projectId}`
        );
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

  useEffect(() => {
    if (!projectId) return;
    async function loadBilling() {
      try {
        const res = await fetch(
          `/api/internal/project/billing?projectId=${projectId}`
        );
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || "Failed to load billing");
        }
        const data = (await res.json()) as BillingInfo;
        setBilling(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingBilling(false);
      }
    }
    loadBilling();
  }, [projectId]);

  // Ensure owner email is set
  useEffect(() => {
    async function ensureOwnerEmail() {
      if (!projectId) return;
      const { data: { user }, error } = await supabaseBrowser.auth.getUser();
      if (error || !user?.email) return;

      try {
        await fetch("/api/internal/project/owner-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ project_id: projectId, email: user.email }),
        });
      } catch (e) {
        console.error("Failed to ensure owner_email", e);
      }
    }
    ensureOwnerEmail();
  }, [projectId]);

  // --- High-End Loading Screen (Custom Logo) ---
  if (loadingProject || loadingBilling) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]">
        <div className="flex flex-col items-center gap-6">
           <div className="relative h-16 w-16 animate-pulse">
             <Image src="/logo.png" alt="TrialRescue" fill className="object-contain opacity-80" />
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
            <Lock size={20} />
          </div>
          <p className="text-sm font-medium">Authentication required.</p>
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

  const status = billing?.billing_status || "free";
  const isActive = status === "active";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-black font-sans text-zinc-100 selection:bg-white/20">
      
      {/* Sidebar - "Floating Dock" Style */}
      <aside className="relative z-20 hidden w-[260px] flex-col p-4 md:flex">
        <div className="flex h-full flex-col justify-between rounded-[24px] border border-white/[0.08] bg-[#050505] px-4 py-6 shadow-2xl">
          
          {/* Top Section */}
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
                href="/"
                icon={LayoutDashboard}
                label="Overview"
                isActive={pathname === "/"}
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

          {/* Bottom Section: User & Logout */}
          <div className="border-t border-white/[0.06] pt-4">
             {/* User Profile */}
             <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/[0.03] p-3 border border-white/[0.02]">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-zinc-400">
                   <User size={14} />
                </div>
                <div className="flex flex-col overflow-hidden">
                   <span className="truncate text-[11px] font-medium text-zinc-200">
                     {userEmail || "Loading..."}
                   </span>
                   <span className="text-[10px] text-zinc-500">Administrator</span>
                </div>
             </div>

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

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 overflow-y-auto scroll-smooth p-4 md:p-6 bg-[#000000]">
        
        {/* Mobile Nav Toggle Placeholder (Hidden on Desktop) */}
        <div className="md:hidden mb-6 flex justify-between items-center">
              <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-white p-1 text-black shadow-lg shadow-white/20">
                <Image
                  src="/logo.png"
                  alt="TrialRescue Logo"
                  fill
                  className="object-contain"
                />
             <span className="font-bold text-white">TrialRescue</span>
           </div>
           {/* Add Mobile Menu Logic Here if needed */}
        </div>

        {isActive ? (
          <PaidDashboard summary={summary} loadingSummary={loadingSummary} />
        ) : (
          <div className="mx-auto max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Locked State Header */}
            <div className="mb-8 flex items-end justify-between border-b border-white/[0.06] pb-8">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                           <Lock size={10} />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-widest text-amber-500">Trial Mode</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Activate Workspace</h1>
                    <p className="mt-2 text-[13px] text-zinc-400 max-w-lg leading-relaxed">
                        Your account is initialized but restricted. Upgrade to unlock the automation engine and start recovering lost revenue.
                    </p>
                </div>
                
                <Link
                    href="/billing"
                    className="hidden md:flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-[12px] font-bold text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-transform hover:scale-105 active:scale-95"
                >
                    <Sparkles size={14} className="text-amber-600 fill-amber-600" />
                    Unlock Pro
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-[1.6fr_1fr]">
              {/* Pricing Card */}
              <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#050505] p-8 shadow-2xl">
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
                  
                  <div className="flex justify-between items-start mb-8">
                    <div>
                        <div className="inline-flex items-center px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-wide mb-2">
                          Early Bird
                        </div>
                        <h2 className="text-xl font-bold text-white">Founder's Pass</h2>
                    </div>
                    <div className="text-right">
                        <span className="text-4xl font-bold text-white tracking-tighter">$1.99</span>
                        <span className="text-zinc-500 text-sm font-medium">/1st mo</span>
                        <p className="text-[10px] text-zinc-600 mt-1">Then $29.99/mo</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    {[
                        'Unlimited recovered users',
                        'Custom branding & domains',
                        '3-stage smart nudge system',
                        'Direct founder support'
                    ].map((feat) => (
                        <div key={feat} className="flex items-center gap-3">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-black">
                                <CheckCircle2 size={12} />
                            </div>
                            <span className="text-sm text-zinc-300 font-medium">{feat}</span>
                        </div>
                    ))}
                  </div>

                  <Link
                    href="/billing"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-sm font-bold text-black transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Upgrade Now
                    <ArrowRight size={14} />
                  </Link>
                  
                  <p className="mt-4 text-center text-[10px] text-zinc-500">
                    One-time setup. Cancel anytime.
                  </p>
              </div>

              {/* Status & Resources */}
              <div className="space-y-4">
                  <div className="rounded-[24px] border border-white/10 bg-[#0A0A0A] p-6">
                    <h3 className="text-sm font-bold text-white mb-4">Current Limits</h3>
                    <ul className="space-y-3">
                        <li className="flex items-center justify-between text-[12px]">
                            <span className="text-zinc-400">Integration</span>
                            <span className="text-emerald-400 font-medium">Active</span>
                        </li>
                        <li className="flex items-center justify-between text-[12px]">
                            <span className="text-zinc-400">Configuration</span>
                            <span className="text-emerald-400 font-medium">Unlocked</span>
                        </li>
                        <li className="flex items-center justify-between text-[12px]">
                            <span className="text-zinc-400">Live Nudges</span>
                            <span className="text-zinc-600 font-medium flex items-center gap-1">
                                <Lock size={10} /> Locked
                            </span>
                        </li>
                    </ul>
                  </div>

                  <div className="rounded-[24px] border border-white/10 bg-[#0A0A0A] p-6">
                    <h3 className="text-sm font-bold text-white mb-4">Resources</h3>
                    <div className="space-y-2">
                        <Link href="/integration" className="block w-full text-left px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-zinc-300 transition-colors">
                            View Integration Guide
                        </Link>
                        <Link href="/settings" className="block w-full text-left px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-zinc-300 transition-colors">
                            Configure Branding
                        </Link>
                    </div>
                  </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
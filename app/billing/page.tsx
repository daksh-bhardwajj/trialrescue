/* eslint-disable react/no-children-prop */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Activity, useEffect, useState } from "react";
import Link from "next/link";
import { useCurrentProject } from "../hooks/useCurrentProject";
import { 
  CreditCard, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  LayoutTemplate,
  Lock,
  Zap,
  CheckCircle2
} from "lucide-react";

// --- Constants ---
const DODO_CHECKOUT_URL = "https://test.checkout.dodopayments.com/buy/pdt_QHCAcn9ESVuD8CTugvw6r?quantity=1&redirect_url=https://trialrescue.vercel.app%2Fapp%2Fbilling%2Fsuccess";

// --- Types ---
type BillingInfo = {
  id: string;
  billing_status: string | null;
  billing_plan: string | null;
  billing_updated_at: string | null;
};

// --- Components ---

function StatusBadge({ active }: { active: boolean }) {
  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${
      active 
        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]" 
        : "border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
    }`}>
      <span className="relative flex h-1.5 w-1.5">
        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${active ? "bg-emerald-400" : "bg-amber-400"}`}></span>
        <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-amber-500"}`}></span>
      </span>
      {active ? "Active Plan" : "Trial Restrictions"}
    </div>
  );
}

export default function BillingPage() {
  const { projectId, loading: loadingProject, error: projectError } = useCurrentProject();

  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/internal/project/billing?projectId=${projectId}`
        );
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || "Failed to load billing");
        }
        const json = (await res.json()) as BillingInfo;
        if (!cancelled) setBilling(json);
      } catch (err: any) {
        console.error(err);
        if (!cancelled) setError(err.message || "Failed to load billing");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  // --- Loading State ---
  if (loadingProject || (loading && !billing)) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050505]">
         <div className="pointer-events-none absolute inset-0 opacity-[0.1]">
            <div className="h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
         </div>
         <div className="relative flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-500">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.08] shadow-2xl backdrop-blur-md">
               <CreditCard size={24} className="relative z-10 text-white animate-pulse" />
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-600 animate-pulse">
               Fetching Plan
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

  const status = billing?.billing_status || "free";
  const isActive = status === "active";

  // --- Main UI ---
  return (
    <div className="flex min-h-screen w-full bg-[#050505] font-sans selection:bg-white/20">
      
      {/* Background Grid */}
      <div className="pointer-events-none fixed inset-0 z-0 flex justify-center opacity-[0.15]">
        <div className="h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto px-6 py-8 md:px-12 md:py-10">
        <div className="mx-auto max-w-5xl space-y-10">
          
          {/* Header */}
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end border-b border-white/[0.08] pb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-widest text-zinc-500">
                <CreditCard size={12} />
                Subscription
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Billing & Usage
              </h1>
              <p className="text-[13px] text-zinc-400 max-w-lg leading-relaxed">
                Manage your subscription and unlock full automation capabilities. 
                {isActive 
                  ? " Your workspace is fully active." 
                  : " Upgrade required to enable live nudges."
                }
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
               <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">Current Status</span>
               <StatusBadge active={isActive} />
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] text-red-200 flex items-center gap-2">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
            
            {/* Left Column: Plan Card */}
            <div className="relative group">
                <div className={`absolute -inset-0.5 rounded-[32px] blur-xl opacity-20 transition-opacity duration-500 ${isActive ? "bg-emerald-500" : "bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-500 animate-pulse"}`} />
                
                <div className="relative h-full rounded-[30px] border border-white/10 bg-[#080808] p-8 md:p-10 shadow-2xl overflow-hidden flex flex-col">
                   {/* Metal sheen effect */}
                   <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
                   
                   <div className="flex justify-between items-start mb-8">
                      <div>
                         <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-white">Early Bird</h3>
                            {!isActive && (
                                <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] font-bold text-amber-400 uppercase tracking-wide">
                                    Limited
                                </span>
                            )}
                         </div>
                         <p className="text-sm text-zinc-500">Founder Special • 20 Seats</p>
                      </div>
                      <div className="text-right">
                         <span className="text-4xl font-bold text-white tracking-tighter">$19</span>
                         <span className="text-zinc-500 font-medium text-sm">/mo</span>
                      </div>
                   </div>

                   <div className="space-y-5 mb-10 flex-1">
                      {[
                          'Unlimited recovered users', 
                          'Custom sender branding', 
                          '3-stage smart nudge sequences', 
                          'Priority founder support',
                          'Cancel anytime'
                      ].map((feat) => (
                         <div key={feat} className="flex items-center gap-3">
                            <div className={`flex h-5 w-5 items-center justify-center rounded-full ${isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-white text-black"}`}>
                               <Check size={12} strokeWidth={3} />
                            </div>
                            <span className="text-sm text-zinc-300 font-medium">{feat}</span>
                         </div>
                      ))}
                   </div>

                   {isActive ? (
                        <div className="mt-auto w-full rounded-xl border border-emerald-500/20 bg-emerald-500/10 py-4 text-center">
                            <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm">
                                <CheckCircle2 size={16} />
                                Plan Active
                            </div>
                            <p className="text-[10px] text-emerald-300/70 mt-1">Thank you for supporting us.</p>
                        </div>
                   ) : (
                        <a 
                            href={DODO_CHECKOUT_URL}
                            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-white py-4 text-sm font-bold text-black transition-all hover:bg-zinc-200 hover:scale-[1.02] shadow-lg shadow-white/10"
                        >
                            Upgrade Now
                            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                        </a>
                   )}
                   
                   {!isActive && (
                        <div className="mt-6 flex justify-center gap-4 opacity-50">
                            <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                                <ShieldCheck size={12} />
                                <span>Secure Payment</span>
                            </div>
                        </div>
                   )}
                </div>
            </div>

            {/* Right Column: Status & Info */}
            <div className="space-y-6">
               
               {/* Current Limits */}
               <div className="rounded-[24px] border border-white/[0.08] bg-[#0A0A0A] p-6 backdrop-blur-sm">
                  <div className="mb-6 flex items-center gap-3">
                     <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-white/5 text-zinc-400">
                        <Activity children={undefined}/>
                     </div>
                     <h3 className="text-sm font-bold text-white">System Status</h3>
                  </div>
                  
                  <div className="space-y-4">
                     <div className="flex items-center justify-between text-[12px]">
                        <span className="text-zinc-400">Integration API</span>
                        <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                           <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                           Active
                        </div>
                     </div>
                     <div className="h-px w-full bg-white/5" />
                     <div className="flex items-center justify-between text-[12px]">
                        <span className="text-zinc-400">Configuration</span>
                        <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                           <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                           Active
                        </div>
                     </div>
                     <div className="h-px w-full bg-white/5" />
                     <div className="flex items-center justify-between text-[12px]">
                        <span className="text-zinc-400">Email Nudges</span>
                        {isActive ? (
                            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Live
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 text-amber-400 font-medium">
                                <Lock size={10} />
                                Locked
                            </div>
                        )}
                     </div>
                  </div>
               </div>

               {/* Quick Links */}
               <div className="rounded-[24px] border border-white/[0.08] bg-[#0A0A0A] p-6 backdrop-blur-sm">
                  <h3 className="text-sm font-bold text-white mb-4">Workspace</h3>
                  <div className="space-y-2">
                     <Link href="/app" className="group flex w-full items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3 text-[12px] text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white">
                        <span>Go to Dashboard</span>
                        <ArrowRight size={12} className="opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                     </Link>
                     <Link href="/settings" className="group flex w-full items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3 text-[12px] text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white">
                        <span>Branding Settings</span>
                        <ArrowRight size={12} className="opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                     </Link>
                  </div>
               </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
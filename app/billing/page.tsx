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
  Settings,
  LogOut,
  Zap,
  Layers,
  CheckCircle2,
  Sparkles,
  Lock,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  Loader2,
  AlertCircle,
  HelpCircle,
  Clock,
  Check
} from "lucide-react";

// --- Constants ---
const DODO_CHECKOUT_URL =
  "https://test.checkout.dodopayments.com/buy/pdt_QfENHSfu1kRvmtdToiUng?quantity=1&redirect_url=https://www.trialrescue.vercel.app%2Fapp%2Fbilling%2Fsuccess";

// --- Types ---
type BillingInfo = {
  id: string;
  billing_status: string | null;
  billing_plan: string | null;
  billing_updated_at: string | null;
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

function StatusBadge({ active }: { active: boolean }) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${
        active
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
          : "border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
      }`}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span
          className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
            active ? "bg-emerald-400" : "bg-amber-400"
          }`}
        ></span>
        <span
          className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
            active ? "bg-emerald-500" : "bg-amber-500"
          }`}
        ></span>
      </span>
      {active ? "Active Plan" : "Trial Restrictions"}
    </div>
  );
}

export default function BillingPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { projectId, loading: loadingProject, error: projectError } = useCurrentProject();

  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]">
         <div className="flex flex-col items-center gap-6">
            <div className="relative h-16 w-16 flex items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                <CreditCard size={32} className="text-zinc-500 animate-pulse" />
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

  const status = billing?.billing_status || "free";
  const isActive = status === "active";

  // --- Main Layout ---
  return (
    <div className="flex h-screen w-full overflow-hidden bg-black font-sans text-zinc-100 selection:bg-white/20">
      
      {/* Ambient Background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-[-10%] top-[-20%] h-[600px] w-[600px] rounded-full bg-purple-500/[0.03] blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-500/[0.02] blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />
      </div>

      {/* Sidebar */}
      <aside className="relative z-20 hidden w-[260px] flex-col p-4 md:flex">
        <div className="flex h-full flex-col justify-between rounded-[24px] border border-white/[0.08] bg-[#050505] px-4 py-6 shadow-2xl">
          <div className="space-y-8">
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

            <nav className="space-y-1">
              <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                Platform
              </div>
              <NavItem href="/app" icon={LayoutDashboard} label="Overview" isActive={false} />
              <NavItem href="/integration" icon={Layers} label="Integration" isActive={false} />
              <NavItem href="/settings" icon={Settings} label="Settings" isActive={false} />
              <NavItem href="/billing" icon={isActive ? CreditCard : Sparkles} label={isActive ? "Billing" : "Upgrade"} isActive={true} />
            </nav>
          </div>

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
      <main className="relative z-10 flex-1 overflow-y-auto scroll-smooth p-4 md:p-6">
        <div className="mx-auto max-w-5xl animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          {/* Header */}
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-white/[0.06] pb-8 mb-8">
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                    <Sparkles size={12} />
                    Subscription
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-md">
                    Billing & Usage
                </h1>
                <p className="text-[13px] text-zinc-400 max-w-lg leading-relaxed">
                    Manage your plan. Lock in the Early Bird offer before public pricing goes live.
                </p>
            </div>
            
            <StatusBadge active={isActive} />
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
            
            {/* Left Column: Plan Card */}
            <div className="group relative">
                {/* Glow Effect */}
                <div className={`absolute -inset-0.5 rounded-[32px] blur-xl opacity-20 transition-opacity duration-500 ${isActive ? "bg-emerald-500" : "bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-500 animate-pulse"}`} />
                
                <div className="relative h-full rounded-[30px] border border-white/10 bg-[#0A0A0A] p-8 md:p-10 shadow-2xl overflow-hidden flex flex-col">
                   {/* Metal sheen effect */}
                   <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
                   
                   {/* Card Header */}
                   <div className="flex justify-between items-start mb-8">
                      <div>
                          <div className="flex items-center gap-2 mb-2">
                             <h3 className="text-xl font-bold text-white">Founder's Pass</h3>
                             {!isActive && (
                                 <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] font-bold text-amber-400 uppercase tracking-wide">
                                     Early Bird
                                 </span>
                             )}
                          </div>
                          <p className="text-sm text-zinc-500">Full revenue recovery suite.</p>
                      </div>
                      <div className="text-right">
                          <div className="flex items-baseline justify-end gap-1">
                             <span className="text-4xl font-bold text-white tracking-tighter">$1.99</span>
                             <span className="text-zinc-500 font-medium text-sm">/1st mo</span>
                          </div>
                          <p className="text-[10px] text-zinc-600 mt-1">Then $29/mo</p>
                      </div>
                   </div>

                   {/* Divider */}
                   <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

                   {/* Features */}
                   <div className="space-y-5 mb-10 flex-1">
                      {[
                          'Unlimited recovered users', 
                          'Custom sender branding', 
                          '3-stage smart nudge sequences', 
                          'Revenue attribution dashboard',
                          'Cancel anytime'
                      ].map((feat) => (
                          <div key={feat} className="flex items-center gap-3 group/item">
                             <div className={`flex h-5 w-5 items-center justify-center rounded-full transition-colors ${isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-white text-black"}`}>
                                <Check size={12} strokeWidth={3} />
                             </div>
                             <span className="text-sm text-zinc-300 font-medium group-hover/item:text-white transition-colors">{feat}</span>
                          </div>
                      ))}
                   </div>

                   {/* Action Area */}
                   {isActive ? (
                        <div className="mt-auto w-full rounded-xl border border-emerald-500/20 bg-emerald-500/10 py-4 text-center">
                            <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm">
                                <CheckCircle2 size={16} />
                                Plan Active
                            </div>
                            <p className="text-[10px] text-emerald-300/70 mt-1">Your Early Bird rate is locked in.</p>
                        </div>
                   ) : (
                        <>
                            <a 
                                href={DODO_CHECKOUT_URL}
                                className="group/btn relative w-full overflow-hidden rounded-2xl bg-white py-4 text-center text-sm font-bold text-black transition-transform hover:scale-[1.01] active:scale-[0.98]"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    Upgrade to Early Bird
                                    <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
                                </span>
                                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-100 opacity-0 transition-opacity duration-500 group-hover/btn:opacity-100" />
                            </a>
                            <div className="mt-6 flex justify-center gap-4 opacity-50">
                                <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                                    <ShieldCheck size={12} />
                                    <span>Secure Payment</span>
                                </div>
                            </div>
                        </>
                   )}
                </div>
            </div>

            {/* Right Column: Info & Help */}
            <div className="space-y-6">
               
               {/* Current Status Box */}
               <div className="rounded-[24px] border border-white/[0.08] bg-[#0A0A0A] p-6 backdrop-blur-sm">
                  <h3 className="text-sm font-bold text-white mb-4">Account Limits</h3>
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

               {/* Help Box */}
               <div className="rounded-[24px] border border-white/[0.08] bg-[#0A0A0A] p-6 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-4">
                     <HelpCircle size={14} className="text-zinc-400" />
                     <h3 className="text-sm font-bold text-white">Billing FAQ</h3>
                  </div>
                  <div className="space-y-3">
                     <div className="group cursor-default">
                        <p className="text-[11px] text-zinc-300 font-medium mb-1 group-hover:text-white transition-colors">When does billing start?</p>
                        <p className="text-[11px] text-zinc-500 leading-relaxed">Billing starts immediately upon upgrade. The first month is discounted to $1.99.</p>
                     </div>
                     <div className="group cursor-default">
                        <p className="text-[11px] text-zinc-300 font-medium mb-1 group-hover:text-white transition-colors">Can I cancel?</p>
                        <p className="text-[11px] text-zinc-500 leading-relaxed">Yes, cancel anytime from this dashboard. Your access remains until the end of the billing cycle.</p>
                     </div>
                  </div>
               </div>

               {/* Contact Support */}
               <a href="mailto:support@trialrescue.com" className="block text-center text-[11px] text-zinc-500 hover:text-white transition-colors">
                  Need help with billing? Contact Support
               </a>

            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
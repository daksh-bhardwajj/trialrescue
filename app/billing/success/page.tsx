/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";

export default function BillingSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Countdown timer
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    // Redirect
    const timeout = setTimeout(() => {
      router.push("/app");
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-[#020202] font-sans text-zinc-100 selection:bg-emerald-500/30 overflow-hidden">
      
      {/* --- Ambient Lighting (Celebratory Emerald) --- */}
      <div className="pointer-events-none fixed inset-0 z-0">
         <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-emerald-500/[0.08] blur-[120px] opacity-60" />
         <div className="absolute bottom-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-blue-500/[0.03] blur-[150px]" />
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 w-full max-w-lg px-6 animate-in fade-in zoom-in-95 duration-700">
        
        <div className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-[#0A0A0A] p-8 shadow-2xl">
           
           {/* Top Sheen */}
           <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
           <div className="absolute bottom-0 inset-x-0 h-1 bg-zinc-900">
              <div 
                className="h-full bg-emerald-500 transition-all duration-1000 ease-linear" 
                style={{ width: `${(10 - countdown) * 10}%` }}
              />
           </div>

           <div className="relative z-10 flex flex-col items-center text-center">
              
              {/* Success Icon */}
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)]">
                 <div className="relative">
                    <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-20 duration-1000" />
                    <Check size={40} className="text-emerald-400 relative z-10" strokeWidth={3} />
                 </div>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Payment Confirmed</h1>
              <p className="text-zinc-400 text-sm max-w-xs mb-8">
                 Welcome to the Early Bird club. Your TrialRescue workspace has been successfully activated.
              </p>

              {/* What Happens Next Card */}
              <div className="w-full rounded-2xl border border-white/5 bg-white/[0.02] p-5 text-left mb-8">
                 <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck size={14} className="text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">System Activated</span>
                 </div>
                 <ul className="space-y-3">
                    {[
                        "Billing status set to Active",
                        "Nudge automation engine started",
                        "Analytics dashboard unlocked"
                    ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-[13px] text-zinc-300">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                            {item}
                        </li>
                    ))}
                 </ul>
              </div>

              {/* Actions */}
              <div className="flex w-full flex-col gap-3">
                 <Link 
                    href="/app"
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-bold text-black transition-transform hover:scale-[1.02] active:scale-[0.98]"
                 >
                    Enter Dashboard
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                 </Link>
                 
                 <div className="flex items-center justify-between px-2 mt-2">
                    <Link href="/billing" className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors">
                        View Receipt
                    </Link>
                    <span className="flex items-center gap-2 text-[11px] text-zinc-600 font-mono">
                       <Loader2 size={10} className="animate-spin" />
                       Redirecting in {countdown}s
                    </span>
                 </div>
              </div>

           </div>
        </div>

        {/* Footer Support Note */}
        <p className="mt-8 text-center text-[11px] text-zinc-600 max-w-sm mx-auto">
           If your account doesn't update immediately, don't worry. It can take a few moments to sync. Refresh the page or contact support.
        </p>

      </div>
    </div>
  );
}
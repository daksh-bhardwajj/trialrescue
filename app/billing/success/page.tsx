/* eslint-disable react/no-unescaped-entities */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ArrowRight, ShieldCheck, Loader2, Zap, LucideLoader } from "lucide-react";

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
         <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-emerald-500/[0.06] blur-[120px] opacity-60" />
         <div className="absolute bottom-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-blue-500/[0.02] blur-[150px]" />
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6 animate-in fade-in zoom-in-95 duration-700">
        
        {/* Main Card */}
        <div className="group relative overflow-hidden rounded-[32px] border border-white/[0.08] bg-[#0A0A0A] p-1 shadow-2xl">
           
           {/* Inner Content Wrapper */}
           <div className="relative rounded-[28px] bg-[#050505]/80 p-8 backdrop-blur-xl overflow-hidden">
              
              {/* Progress Bar (Top) */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-white/5">
                  <div 
                    className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000 ease-linear" 
                    style={{ width: `${(10 - countdown) * 10}%` }}
                  />
              </div>

              <div className="flex flex-col items-center text-center pt-4">
                  
                  {/* Success Icon with Ripple */}
                  <div className="mb-8 relative">
                     <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse" />
                     <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 shadow-2xl">
                        <Check size={32} className="text-emerald-400" strokeWidth={3} />
                     </div>
                  </div>

                  <h1 className="text-3xl font-bold tracking-tighter text-white mb-3">Payment Confirmed</h1>
                  <p className="text-zinc-400 text-[13px] leading-relaxed max-w-[280px] mb-8">
                     Welcome to the Early Bird club. Your workspace is now fully active.
                  </p>

                  {/* Activation Status Card */}
                  <div className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-left mb-8 backdrop-blur-sm">
                     <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/[0.04]">
                        <Zap size={14} className="text-emerald-400 fill-emerald-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">System Status</span>
                     </div>
                     <ul className="space-y-3">
                        {[
                            "Billing status set to Active",
                            "Nudge automation engine started",
                            "Analytics dashboard unlocked"
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-3 text-[12px] text-zinc-300 font-medium">
                                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                  <Check size={8} className="text-emerald-400" />
                                </div>
                                {item}
                            </li>
                        ))}
                     </ul>
                  </div>

                  {/* Primary Action */}
                  <Link 
                      href="/app"
                      className="group relative w-full overflow-hidden rounded-xl bg-white py-3.5 text-[13px] font-bold text-black transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-white/5"
                  >
                      <div className="relative z-10 flex items-center justify-center gap-2">
                          Enter Dashboard
                          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                      </div>
                      {/* Button Shimmer */}
                      <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-zinc-200/50 to-transparent z-0 pointer-events-none" />
                  </Link>
                  
                  <div className="flex w-full items-center justify-between px-1 mt-4">
                      <Link href="/billing" className="text-[11px] font-medium text-zinc-500 hover:text-white transition-colors">
                          View Receipt
                      </Link>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-600 bg-white/5 px-2 py-1 rounded-md">
                         <LucideLoader size={10} className="animate-spin" />
                         Redirecting in {countdown}s
                      </div>
                  </div>

              </div>
           </div>
        </div>

        {/* Footer Support Note */}
        <p className="mt-8 text-center text-[11px] text-zinc-600 max-w-xs mx-auto">
           If your account doesn't update immediately, don't worry. It can take a few moments to sync. Refresh or contact support.
        </p>

      </div>
    </div>
  );
}
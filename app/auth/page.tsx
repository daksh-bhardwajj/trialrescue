/* eslint-disable react/jsx-no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { 
  Loader2, 
  Zap, 
  ArrowRight, 
  Mail, 
  Lock, 
  Briefcase,
  ChevronLeft,
  Sparkles,
  LoaderPinwheel,
  LucideLoader
} from "lucide-react";
import Image from "next/image";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [projectName, setProjectName] = useState("My SaaS");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "signup") {
        const { data, error } = await supabaseBrowser.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        const user = data.user;
        if (!user) throw new Error("No user returned from signup");

        // We no longer create the project here.
        // resolve-project will auto-create it on first dashboard load.
        router.push("/app");
      } else {
        const { error } = await supabaseBrowser.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/app");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-black px-4 font-sans selection:bg-white/20 overflow-hidden">
      
      {/* Ambient Background & Noise */}
      <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-500/[0.04] blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-500/[0.04] blur-[120px]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      {/* Navigation (Back Button) */}
      <div className="absolute top-6 left-6 z-20 md:top-10 md:left-10">
        <Link 
          href="/" 
          className="group flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-[13px] font-medium text-zinc-400 backdrop-blur-md transition-all hover:bg-white/10 hover:text-white hover:pl-3 hover:pr-5"
        >
          <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
          Back
        </Link>
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-[420px] animate-in fade-in zoom-in-95 duration-700">
        
        {/* Brand Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {mode === "signup" ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="mt-3 text-[14px] text-zinc-400 max-w-[300px] leading-relaxed">
            {mode === "signup"
              ? "Automate your customer recovery."
              : "Access your dashboard to view recovery metrics."}
          </p>
        </div>

        {/* Form Container */}
        <div className="rounded-[32px] border border-white/[0.08] bg-[#0A0A0A]/60 p-8 backdrop-blur-2xl shadow-2xl ring-1 ring-white/[0.02]">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Project Name (Signup Only) - Animated Collapse */}
            <div className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${mode === "signup" ? "max-h-24 opacity-100" : "max-h-0 opacity-0"}`}>
               <div className="space-y-2">
                   <div className="relative group">
                     <input
                       type="text"
                       className="peer w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3.5 pl-11 text-sm text-white placeholder:text-zinc-600 outline-none transition-all focus:border-white/20 focus:bg-white/[0.03] focus:ring-1 focus:ring-white/20"
                       value={projectName}
                       onChange={(e) => setProjectName(e.target.value)}
                       placeholder="Project Name"
                     />
                     <Briefcase size={18} className="absolute left-4 top-3.5 text-zinc-600 transition-colors peer-focus:text-zinc-300" />
                   </div>
                   <div className="flex items-center gap-1.5 px-2">
                      <Sparkles size={10} className="text-zinc-600" />
                      <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">
                        Workspace Name
                      </p>
                   </div>
               </div>
            </div>

            {/* Email */}
            <div className="relative group">
              <input
                type="email"
                required
                className="peer w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3.5 pl-11 text-sm text-white placeholder:text-zinc-600 outline-none transition-all focus:border-white/20 focus:bg-white/[0.03] focus:ring-1 focus:ring-white/20"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
              />
              <Mail size={18} className="absolute left-4 top-3.5 text-zinc-600 transition-colors peer-focus:text-zinc-300" />
            </div>

            {/* Password */}
            <div className="relative group">
              <input
                type="password"
                required
                className="peer w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3.5 pl-11 text-sm text-white placeholder:text-zinc-600 outline-none transition-all focus:border-white/20 focus:bg-white/[0.03] focus:ring-1 focus:ring-white/20"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />
              <Lock size={18} className="absolute left-4 top-3.5 text-zinc-600 transition-colors peer-focus:text-zinc-300" />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[12px] font-medium text-red-200 animate-in fade-in slide-in-from-top-2">
                <div className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-[13px] font-bold text-black transition-all hover:bg-zinc-200 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
            >
              {loading ? (
                <LucideLoader size={18} className="animate-spin text-zinc-600" />
              ) : (
                <>
                  {mode === "signup" ? "Get Started" : "Sign In"}
                  <ArrowRight size={16} className="opacity-60 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-8 border-t border-white/[0.06] pt-6 text-center">
             <p className="text-[13px] text-zinc-500">
                {mode === "signup" ? "Already have an account?" : "Don't have an account yet?"}{" "}
                <button
                  type="button"
                  onClick={() => setMode(mode === "signup" ? "login" : "signup")}
                  className="font-medium text-white transition-all hover:text-zinc-300 hover:underline underline-offset-4 decoration-zinc-700"
                >
                   {mode === "signup" ? "Log in" : "Sign up"}
                </button>
             </p>
          </div>
        </div>
        
        {/* Footer Info */}
        <div className="mt-8 flex justify-center gap-8 text-[11px] font-medium text-zinc-600">
           <span className="hover:text-zinc-400 cursor-pointer transition-colors">Privacy Policy</span>
           <span className="hover:text-zinc-400 cursor-pointer transition-colors">Terms of Service</span>
           <span className="hover:text-zinc-400 cursor-pointer transition-colors">Help Center</span>
        </div>

      </div>
    </div>
  );
}
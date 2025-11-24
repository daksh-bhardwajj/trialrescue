/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { 
  Loader2, 
  Zap, 
  ArrowRight, 
  Mail, 
  Lock, 
  Briefcase 
} from "lucide-react";

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
        router.push("/");
      } else {
        const { error } = await supabaseBrowser.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-[#050505] px-4 font-sans selection:bg-white/20">
      
      {/* Background Grid & Ambient Glow */}
      <div className="pointer-events-none fixed inset-0 z-0 flex justify-center opacity-[0.15]">
        <div className="h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>
      <div className="absolute inset-0 z-0 bg-gradient-to-tr from-emerald-500/[0.03] via-transparent to-blue-500/[0.03] pointer-events-none" />

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-[400px] animate-in fade-in zoom-in-95 duration-500">
        
        {/* Brand Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.08] shadow-xl backdrop-blur-md">
            <Zap size={20} className="text-white fill-white/20" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-[13px] text-zinc-400 max-w-[280px]">
            {mode === "signup"
              ? "Start recovering lost trials automatically. No credit card required."
              : "Sign in to view your dashboard and performance metrics."}
          </p>
        </div>

        {/* Form Container */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0A0A0A]/50 p-6 backdrop-blur-xl shadow-2xl ring-1 ring-white/[0.02]">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Project Name (Signup Only) */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${mode === "signup" ? "max-h-24 opacity-100" : "max-h-0 opacity-0"}`}>
               <div className="relative group">
                 <input
                   type="text"
                   className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 pl-10 text-sm text-white placeholder:text-zinc-600 outline-none transition-all focus:border-white/20 focus:bg-white/[0.02] focus:ring-1 focus:ring-white/20"
                   value={projectName}
                   onChange={(e) => setProjectName(e.target.value)}
                   placeholder="Project Name"
                 />
                 <Briefcase size={16} className="absolute left-3.5 top-3.5 text-zinc-600 transition-colors group-focus-within:text-zinc-400" />
               </div>
               <p className="mt-1.5 px-1 text-[10px] text-zinc-500">
                 *Your default project name (cosmetic only).
               </p>
            </div>

            {/* Email */}
            <div className="relative group">
              <input
                type="email"
                required
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 pl-10 text-sm text-white placeholder:text-zinc-600 outline-none transition-all focus:border-white/20 focus:bg-white/[0.02] focus:ring-1 focus:ring-white/20"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
              />
              <Mail size={16} className="absolute left-3.5 top-3.5 text-zinc-600 transition-colors group-focus-within:text-zinc-400" />
            </div>

            {/* Password */}
            <div className="relative group">
              <input
                type="password"
                required
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 pl-10 text-sm text-white placeholder:text-zinc-600 outline-none transition-all focus:border-white/20 focus:bg-white/[0.02] focus:ring-1 focus:ring-white/20"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />
              <Lock size={16} className="absolute left-3.5 top-3.5 text-zinc-600 transition-colors group-focus-within:text-zinc-400" />
            </div>

            {/* Error Message */}
            {error && (
              <div className="animate-in fade-in slide-in-from-top-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-[12px] text-red-200">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-semibold text-black transition-all hover:bg-zinc-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] active:scale-95 disabled:opacity-70 disabled:active:scale-100"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin text-zinc-600" />
              ) : (
                <>
                  {mode === "signup" ? "Get Started" : "Sign In"}
                  <ArrowRight size={16} className="opacity-60 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 border-t border-white/[0.06] pt-4 text-center">
             <p className="text-[12px] text-zinc-500">
                {mode === "signup" ? "Already have an account?" : "Don't have an account yet?"}{" "}
                <button
                  type="button"
                  onClick={() => setMode(mode === "signup" ? "login" : "signup")}
                  className="font-medium text-white underline decoration-zinc-700 underline-offset-4 transition-colors hover:decoration-white"
                >
                   {mode === "signup" ? "Log in" : "Sign up"}
                </button>
             </p>
          </div>
        </div>
        
        {/* Footer Info */}
        <div className="mt-8 flex justify-center gap-6 text-[11px] text-zinc-600">
           <span className="hover:text-zinc-400 cursor-pointer transition-colors">Privacy</span>
           <span className="hover:text-zinc-400 cursor-pointer transition-colors">Terms</span>
           <span className="hover:text-zinc-400 cursor-pointer transition-colors">Help</span>
        </div>

      </div>
    </div>
  );
}
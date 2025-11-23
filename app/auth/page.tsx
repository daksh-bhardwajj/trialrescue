/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

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
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl">
        <div className="mb-4">
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
            TrialRescue
          </div>
          <h1 className="text-lg font-semibold text-slate-50 mt-1">
            {mode === "signup" ? "Create your account" : "Sign in"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {mode === "signup"
              ? "We’ll auto-create your first project and API key when you hit the dashboard."
              : "Access your projects and trial rescue stats."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-slate-200">Email</label>
            <input
              type="email"
              className="w-full mt-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs text-slate-200">Password</label>
            <input
              type="password"
              className="w-full mt-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {mode === "signup" && (
            <div>
              <label className="text-xs text-slate-200">Project name</label>
              <input
                type="text"
                className="w-full mt-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
              <p className="text-[11px] text-slate-500 mt-1">
                (For now, we just auto-create a default project; this field is cosmetic.)
              </p>
            </div>
          )}

          {error && (
            <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-800/60 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center rounded-xl border border-cyan-500/60 bg-cyan-500/20 px-4 py-2 text-xs font-medium text-cyan-100 hover:bg-cyan-500/30 disabled:opacity-60"
          >
            {loading
              ? mode === "signup"
                ? "Creating account…"
                : "Signing in…"
              : mode === "signup"
              ? "Sign up"
              : "Sign in"}
          </button>
        </form>

        <div className="mt-4 text-[11px] text-slate-500">
          {mode === "signup" ? (
            <>
              Already have an account?{" "}
              <button
                type="button"
                className="text-cyan-400 hover:text-cyan-300"
                onClick={() => setMode("login")}
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              New here?{" "}
              <button
                type="button"
                className="text-cyan-400 hover:text-cyan-300"
                onClick={() => setMode("signup")}
              >
                Create an account
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
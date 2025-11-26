/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCurrentProject } from "../hooks/useCurrentProject";

const DODO_CHECKOUT_URL =
  "https://test.checkout.dodopayments.com/buy/pdt_QfENHSfu1kRvmtdToiUng?quantity=1&redirect_url=https://www.trialrescue.vercel.app%2Fapp%2Fbilling%2Fsuccess";

type BillingInfo = {
  id: string;
  billing_status: string | null;
  billing_plan: string | null;
  billing_updated_at: string | null;
};

export default function BillingPage() {
  const { projectId, loading: loadingProject, error: projectError } =
    useCurrentProject();

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

  if (loadingProject) {
    return (
      <div className="flex-1 px-4 md:px-6 py-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-400">
          Resolving your project…
        </div>
      </div>
    );
  }

  if (projectError || !projectId) {
    return (
      <div className="flex-1 px-4 md:px-6 py-6">
        <div className="rounded-2xl border border-rose-800/60 bg-rose-950/40 p-4 text-sm text-rose-200">
          {projectError || "No project found for this account."}
        </div>
      </div>
    );
  }

  const status = billing?.billing_status || "free";
  const isActive = status === "active";

  return (
    <div className="flex-1 px-4 md:px-6 py-6 space-y-4 overflow-y-auto scrollbar-thin">
      <div className="flex items-center justify-between mb-1">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
            Billing
          </div>
          <h1 className="text-lg md:text-xl font-semibold text-slate-50">
            Your plan & access
          </h1>
          <p className="mt-1 text-xs text-slate-500 max-w-2xl">
            Trial Rescue only unlocks full automation for paid accounts. Until
            you upgrade, you can explore the app and integration, but nudges
            won&apos;t be sent.
          </p>
        </div>
        <div className="hidden md:flex flex-col items-end text-xs text-slate-500">
          <span>Current status</span>
          <span
            className={
              isActive
                ? "text-emerald-400 font-medium"
                : "text-amber-300 font-medium"
            }
          >
            {isActive ? "Active (paid)" : "Free (inactive)"}
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-800/60 bg-rose-950/40 px-3 py-2 text-xs text-rose-100">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* Plan card */}
        <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-b from-emerald-500/10 via-slate-950 to-slate-950 p-4 md:p-5 shadow-[0_0_0_1px_rgba(16,185,129,0.3),0_20px_80px_rgba(6,95,70,0.4)]">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
                Early Bird
              </p>
              <p className="text-sm text-slate-200">
                $19/mo · first 20 founders only
              </p>
            </div>
            <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-[10px] font-medium text-emerald-100">
              Limited seats
            </span>
          </div>

          <div className="mb-4 flex items-baseline gap-1">
            <span className="text-3xl font-semibold text-slate-50">$19</span>
            <span className="text-xs text-slate-400">/month</span>
          </div>

          <ul className="mb-4 space-y-1.5 text-[11px] text-slate-100">
            <li>• Automated 3-stage trial nudge system</li>
            <li>• Product-branded emails with your reply-to</li>
            <li>• Works for any trial-based SaaS</li>
            <li>• Direct access to the builder during early access</li>
          </ul>

          {isActive ? (
            <div className="rounded-xl border border-emerald-400/60 bg-emerald-500/10 px-3 py-2 text-[11px] text-emerald-100">
              Your account is active. All automations are enabled. You&apos;re
              good to go.
            </div>
          ) : (
            <>
              <a
                href={DODO_CHECKOUT_URL}
                className="mb-2 flex w-full items-center justify-center rounded-xl border border-emerald-400/80 bg-emerald-500/20 px-4 py-2 text-xs font-semibold text-emerald-50 hover:bg-emerald-500/30"
              >
                Upgrade to Early Bird for $19/mo →
              </a>
              <p className="text-[10px] text-emerald-100/80">
                You&apos;ll be charged immediately. No trial. Cancel anytime
                before the next renewal. Once we confirm payment, we&apos;ll
                switch your status to Active.
              </p>
            </>
          )}
        </div>

        {/* Status / next steps */}
        <div className="space-y-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
            <p className="text-sm font-semibold text-slate-100">
              What happens after you upgrade?
            </p>
            <ul className="mt-2 space-y-1.5 text-[11px] text-slate-400">
              <li>• Your billing status is set to Active.</li>
              <li>• Trial Rescue starts sending nudges to inactive trial users.</li>
              <li>
                • You&apos;ll see rescued trials and upgrades appear in your
                dashboard.
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-[11px] text-slate-400">
            <p className="text-sm font-semibold text-slate-100 mb-1">
              While you&apos;re still on free:
            </p>
            <ul className="space-y-1.5">
              <li>• You can integrate the API and send test events.</li>
              <li>• You can configure branding and automation rules.</li>
              <li>• Emails will not go out to your trial users yet.</li>
            </ul>
            <p className="mt-2">
              If you&apos;ve already paid and still see &quot;Free&quot;, reach
              out via your support email and we&apos;ll flip it to Active.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-[11px] text-slate-400">
            <p className="text-sm font-semibold text-slate-100 mb-1">
              Back to app
            </p>
            <p>
              You can always return to your dashboard and settings while you
              decide:
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Link
                href="/app"
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-[11px] text-slate-100 hover:border-slate-500"
              >
                Go to dashboard
              </Link>
              <Link
                href="/settings"
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-[11px] text-slate-100 hover:border-slate-500"
              >
                Branding & automation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

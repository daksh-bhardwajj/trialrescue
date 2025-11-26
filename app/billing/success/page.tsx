"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

export default function BillingSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Optional: after 10s, push them to /app
    const t = setTimeout(() => {
      router.push("/app");
    }, 10000);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-zinc-100">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-emerald-500/15 via-[#050505] to-[#050505] p-6 shadow-[0_0_0_1px_rgba(16,185,129,0.3),0_20px_80px_rgba(6,95,70,0.5)]">
        {/* Glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-emerald-400/25 blur-[80px]" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-200">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-emerald-50">
                Payment received
              </h1>
              <p className="text-[11px] text-emerald-100/80">
                Thanks for grabbing the Early Bird plan.
              </p>
            </div>
          </div>

          <p className="text-xs text-zinc-300">
            Your payment with our provider has been completed. We&apos;re
            activating your Trial Rescue workspace now. This usually takes a
            short moment while we sync things on our side.
          </p>

          <div className="rounded-2xl border border-emerald-500/30 bg-black/40 p-3 text-[11px] text-zinc-200">
            <p className="font-medium text-emerald-100">
              What happens next:
            </p>
            <ul className="mt-1 space-y-1.5 text-zinc-300">
              <li>• Your billing status will be switched to Active.</li>
              <li>• Trial Rescue will start sending nudges to inactive trials.</li>
              <li>
                • You&apos;ll see rescued trials and upgrades inside your
                dashboard.
              </li>
            </ul>
          </div>

          <p className="text-[11px] text-zinc-400">
            If you don&apos;t see your account as Active within a short time,
            reply to your welcome/payment email or reach out from the email you
            used to sign up and we&apos;ll fix it.
          </p>

          <div className="flex flex-col gap-2 pt-1 text-[11px] md:flex-row md:items-center md:justify-between">
            <div className="flex gap-2">
              <Link
                href="/app"
                className="inline-flex items-center justify-center rounded-xl border border-emerald-400/70 bg-emerald-500/20 px-4 py-1.5 font-semibold text-emerald-50 hover:bg-emerald-500/30"
              >
                Go to dashboard →
              </Link>
              <Link
                href="/billing"
                className="inline-flex items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-1.5 text-zinc-100 hover:border-zinc-500"
              >
                View billing
              </Link>
            </div>
            <p className="text-[10px] text-zinc-500">
              You&apos;ll be redirected to the dashboard in a few seconds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

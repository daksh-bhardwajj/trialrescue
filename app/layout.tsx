import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "TrialRescue – Save your leaking SaaS trials",
  description: "Automatically rescue inactive trial users before they churn.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-50">
        <div className="flex min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}

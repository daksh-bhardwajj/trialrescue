"use client";

import { useState, useEffect } from "react";

export default function ApiKeyPage() {
  const [key, setKey] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/internal/project/api-key");
      if (!res.ok) return;
      const json = await res.json();
      setKey(json.api_key);
    }
    load();
  }, []);

  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-xl font-semibold">API Key</h1>
      <p className="text-sm text-slate-400">
        Use this key to send events to your TrialRescue project.
      </p>
      {key ? (
        <div className="rounded-lg border border-slate-700 bg-slate-900 p-4 font-mono text-sm">
          {key}
        </div>
      ) : (
        <div className="text-slate-500">Loading...</div>
      )}
    </div>
  );
}

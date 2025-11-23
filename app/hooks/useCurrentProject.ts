/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

type CurrentProject = {
  projectId: string | null;
  loading: boolean;
  error: string | null;
};

export function useCurrentProject(): CurrentProject {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      try {
        // 1) Get logged-in user from Supabase auth
        const { data } = await supabaseBrowser.auth.getUser();

        if (!data.user) {
          // not logged in → send to /auth
          router.push("/auth");
          return;
        }

        // 2) Ask backend: “which project belongs to this user?”
        const res = await fetch("/api/internal/resolve-project", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: data.user.id }),
        });

        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || "Failed to load project");
        }

        const j = await res.json();
        setProjectId(j.project_id);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Could not load project");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  return { projectId, loading, error };
}
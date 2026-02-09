import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Investigation {
  id: string;
  query: string;
  entity_type: string;
  scan_mode: string;
  risk_level: string | null;
  classification: string | null;
  summary: string | null;
  ai_bio: string | null;
  results: any[];
  categories: any;
  metadata: any;
  evidence_links: string[];
  threat_profile: any;
  network_map: any;
  pivot_suggestions: any;
  recommendations: any;
  raw_intel: any;
  created_at: string;
}

export function useInvestigationHistory() {
  const [history, setHistory] = useState<Investigation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("investigations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setHistory(data as unknown as Investigation[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const saveInvestigation = useCallback(
    async (investigation: Omit<Investigation, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("investigations")
        .insert(investigation as any)
        .select()
        .single();

      if (!error && data) {
        setHistory((prev) => [data as unknown as Investigation, ...prev]);
        return data;
      }
      return null;
    },
    []
  );

  const deleteInvestigation = useCallback(async (id: string) => {
    await supabase.from("investigations").delete().eq("id", id);
    setHistory((prev) => prev.filter((i) => i.id !== id));
  }, []);

  return { history, loading, fetchHistory, saveInvestigation, deleteInvestigation };
}

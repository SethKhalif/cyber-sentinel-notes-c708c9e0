import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ScanHistoryItem {
  id: string;
  source: string;
  scan_type: string;
  threat_level: string;
  attack_type: string | null;
  probability: number | null;
  mitre_mapping: string | null;
  mitigation: string | null;
  malicious_indicators: string[] | null;
  created_at: string;
}

export function useScanHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("scan_results")
        .select("id, source, scan_type, threat_level, attack_type, probability, mitre_mapping, mitigation, malicious_indicators, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      setHistory((data as ScanHistoryItem[]) ?? []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const deleteItem = async (id: string) => {
    await supabase.from("scan_results").delete().eq("id", id);
    setHistory((prev) => prev.filter((h) => h.id !== id));
  };

  return { history, loading, refresh: fetchHistory, deleteItem };
}

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface ThreatAnalysis {
  id: string;
  note_id: string;
  threat_level: string;
  attack_type: string | null;
  probability: number | null;
  mitre_mapping: string | null;
  mitigation: string | null;
  created_at: string;
}

export function useThreatAnalysis() {
  const [analyzing, setAnalyzing] = useState(false);
  const queryClient = useQueryClient();

  const analyze = async (noteId: string, content: string) => {
    if (!content || content.trim().length < 10) return null;
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-threat", {
        body: { noteId, content },
      });
      if (error) {
        toast.error("Analysis failed: " + error.message);
        return null;
      }
      queryClient.invalidateQueries({ queryKey: ["threat-analysis", noteId] });
      return data;
    } catch (e: any) {
      toast.error(e.message || "Analysis failed");
      return null;
    } finally {
      setAnalyzing(false);
    }
  };

  const getAnalysis = async (noteId: string): Promise<ThreatAnalysis | null> => {
    const { data, error } = await supabase
      .from("threat_analysis")
      .select("*")
      .eq("note_id", noteId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) return null;
    return data as ThreatAnalysis | null;
  };

  return { analyze, getAnalysis, analyzing };
}

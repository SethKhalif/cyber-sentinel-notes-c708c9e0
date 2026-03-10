import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CveResult {
  cve_id: string;
  summary: string;
  exploitation_likelihood: string;
  affected_systems: string;
  mitigation: string;
}

export function useCveAnalysis() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<CveResult | null>(null);

  const analyzeCve = async (cveInput: string) => {
    if (!cveInput.trim()) return;
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-cve", {
        body: { cveInput },
      });
      if (error) {
        toast.error("CVE analysis failed: " + error.message);
        return;
      }
      setResult(data);
    } catch (e: any) {
      toast.error(e.message || "CVE analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  return { analyzeCve, result, analyzing, clearResult: () => setResult(null) };
}

import React, { useEffect, useState } from "react";
import { ThreatAnalysis } from "@/hooks/useThreatAnalysis";
import { useCveAnalysis, CveResult } from "@/hooks/useCveAnalysis";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Shield, AlertTriangle, Target, Percent, BookOpen, Wrench, Download, FileText, BadgeAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListView, ListItem } from "@/components/ListView";
import { exportCveAsMarkdown, exportCveAsPdf } from "@/lib/exportCve";

interface Props {
  analysis: ThreatAnalysis | null;
  analyzing: boolean;
  mode: "notes" | "cve" | "scanner";
  noteId: string | null;
}

const ThreatLevelBadge: React.FC<{ level: string }> = ({ level }) => {
  const isHigh = level.toLowerCase() === "high" || level.toLowerCase() === "critical";
  return (
    <span className={`text-xs font-bold uppercase tracking-wider ${isHigh ? "text-alert" : "text-muted-foreground"}`}>
      {level}
    </span>
  );
};

const IntelligencePanel: React.FC<Props> = ({ analysis, analyzing, mode, noteId }) => {
  const [cveResults, setCveResults] = useState<CveResult[]>([]);

  const loadCveResults = () => {
    supabase
      .from("cve_analyses")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (data) {
          setCveResults(
            data.map((d) => ({
              cve_id: d.cve_id,
              summary: d.summary || "",
              exploitation_likelihood: d.exploitation_likelihood || "",
              affected_systems: d.affected_systems || "",
              mitigation: d.mitigation || "",
            }))
          );
        }
      });
  };

  // Load CVE results when in CVE mode or when analyzing finishes
  useEffect(() => {
    if (mode === "cve") {
      loadCveResults();
    }
  }, [mode, analyzing]);

  if (mode === "cve") {
    const cveListItems: ListItem[] = cveResults.map((cve, i) => ({
      id: `cve-${i}`,
      title: cve.cve_id,
      subtitle: cve.exploitation_likelihood,
      badge: cve.exploitation_likelihood,
      previewText: cve.summary,
      status: cve.exploitation_likelihood === "High" || cve.exploitation_likelihood === "Critical" ? "error" : "info",
      actions: [
        {
          label: "Export as Markdown",
          icon: <FileText className="h-3 w-3" />,
          onClick: () => exportCveAsMarkdown(cve),
        },
        {
          label: "Export as PDF",
          icon: <Download className="h-3 w-3" />,
          onClick: () => exportCveAsPdf(cve),
        },
      ],
    }));

    return (
      <div className="w-[360px] min-w-[360px] border-l border-border flex flex-col bg-background">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <BadgeAlert className="h-4 w-4 text-primary" />
          <h2 className="font-sans font-semibold text-sm text-foreground">CVE Intelligence List</h2>
        </div>
        <ListView 
          items={cveListItems} 
          emptyMessage="No CVE analyses yet. Use the editor to analyze a CVE."
          compact
        />
      </div>
    );
  }

  return (
    <div className="w-[360px] min-w-[360px] border-l border-border flex flex-col bg-background">
      {/* Scan line */}
      {analyzing && (
        <div className="h-0.5 bg-muted overflow-hidden">
          <div className="h-full w-1/3 bg-primary animate-scan-line" />
        </div>
      )}

      <div className="p-4 border-b border-border">
        <h2 className="font-sans font-semibold text-sm text-foreground">Threat Intelligence</h2>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {!analysis && !analyzing && (
          <p className="text-xs text-muted-foreground">
            {noteId ? "Write note content to trigger AI analysis." : "Select a note to view intelligence."}
          </p>
        )}

        {analyzing && !analysis && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-primary">
              <Shield className="h-3.5 w-3.5 animate-pulse" />
              Analyzing threat vectors...
            </div>
          </div>
        )}

        {analysis && (
          <div className="space-y-5">
            {/* Threat Level */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider">
                <AlertTriangle className="h-3 w-3" /> Threat Level
              </div>
              <ThreatLevelBadge level={analysis.threat_level} />
            </div>

            {/* Attack Type */}
            {analysis.attack_type && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider">
                  <Target className="h-3 w-3" /> Attack Type
                </div>
                <p className="text-xs text-foreground">{analysis.attack_type}</p>
              </div>
            )}

            {/* Probability */}
            {analysis.probability !== null && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider">
                  <Percent className="h-3 w-3" /> Attack Probability
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={analysis.probability} className="h-1.5 flex-1" />
                  <span className="text-xs font-mono text-foreground">{analysis.probability}%</span>
                </div>
              </div>
            )}

            {/* MITRE Mapping */}
            {analysis.mitre_mapping && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider">
                  <BookOpen className="h-3 w-3" /> MITRE ATT&CK
                </div>
                <p className="text-xs text-primary font-mono">{analysis.mitre_mapping}</p>
              </div>
            )}

            {/* Mitigation */}
            {analysis.mitigation && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider">
                  <Wrench className="h-3 w-3" /> Mitigation
                </div>
                <p className="text-xs text-foreground leading-relaxed">{analysis.mitigation}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IntelligencePanel;

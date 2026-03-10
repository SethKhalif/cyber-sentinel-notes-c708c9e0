import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Shield, FileText, AlertTriangle, Bug, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Overview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ notes: 0, threats: 0, cves: 0, plan: "free" });

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [notesRes, threatsRes, cvesRes, subRes] = await Promise.all([
        supabase.from("notes").select("id", { count: "exact", head: true }),
        supabase.from("threat_analysis").select("id", { count: "exact", head: true }),
        supabase.from("cve_analyses").select("id", { count: "exact", head: true }),
        supabase.from("subscriptions").select("plan").maybeSingle(),
      ]);
      setStats({
        notes: notesRes.count ?? 0,
        threats: threatsRes.count ?? 0,
        cves: cvesRes.count ?? 0,
        plan: subRes.data?.plan ?? "free",
      });
    };
    load();
  }, [user]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/workspace"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="font-sans text-2xl font-bold text-foreground">Overview</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { icon: FileText, label: "Notes", value: stats.notes, color: "text-primary" },
            { icon: AlertTriangle, label: "Threat Analyses", value: stats.threats, color: "text-warning" },
            { icon: Bug, label: "CVE Analyses", value: stats.cves, color: "text-alert" },
            { icon: Shield, label: "Plan", value: stats.plan.toUpperCase(), color: "text-success" },
          ].map((s) => (
            <Card key={s.label} className="bg-card border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                  <CardTitle className="text-sm font-mono text-muted-foreground">{s.label}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-sans font-bold text-foreground">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Overview;
